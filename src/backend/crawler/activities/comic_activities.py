import uuid
from datetime import datetime
from temporalio import activity
from db.database import async_session_maker
from db.models import Comic, WorkerTask, Asset, WorkerComic, WorkerChapter
from models.comic_models import ComicMetadata, ChapterInfo, AssetMetadata
from utils.http_client import fetch_html
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select
from parsers.factory import get_parser
from core.logger import logger

@activity.defn
async def fetch_and_parse_comic(source_url: str) -> ComicMetadata:
    logger.info("fetch_and_parse_comic started", source_url=source_url)
    parser = get_parser(source_url)
    
    # 1. Fetch main page
    html = await fetch_html(source_url)
    meta_dict = parser.parse_comic_metadata(html, source_url)

    # 2. Fetch Chapters via POST to {url}ajax/chapters/
    chapters = []
    chap_url = source_url.rstrip("/") + "/ajax/chapters/"
    
    import ssl
    import aiohttp
    from utils.http_client import get_random_headers
    
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connector = aiohttp.TCPConnector(ssl=ssl_context)
    
    headers = get_random_headers(referer=source_url)
    headers["X-Requested-With"] = "XMLHttpRequest"
    
    try:
        async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
            async with session.post(chap_url) as response:
                chap_html = await response.text()
                
        chap_list = parser.parse_chapter_list(chap_html, source_url)
        idx = len(chap_list)
        for chap in chap_list:
            # Determine order_index
            try:
                order_index = float(chap["chapter_number"])
            except ValueError:
                order_index = float(idx)
                
            chapters.append(ChapterInfo(
                id=chap["id"],
                chapter_number=chap["chapter_number"],
                order_index=order_index,
                source_url=chap["url"]
            ))
            idx -= 1
            
        logger.info("Successfully fetched chapters", count=len(chapters), url=source_url)
    except Exception as e:
        logger.error("Failed to fetch abstract chapters", url=source_url, exc_info=e)
        
    return ComicMetadata(
        id=meta_dict.get("id", "unknown-slug"),
        source_url=source_url,
        title=meta_dict.get("title", "Unknown Title"),
        author=meta_dict.get("author", "Unknown"),
        description=meta_dict.get("description", ""),
        status=meta_dict.get("status", "Ongoing"),
        categories=meta_dict.get("categories", []),
        logo_path="",
        banner_path="",
        thumbnail_path=meta_dict.get("thumbnail_path", ""),
        chapters=chapters
    )

@activity.defn
async def upsert_comic_in_db(metadata: ComicMetadata) -> dict:
    logger.info("upsert_comic_in_db started", url=metadata.source_url)
    async with async_session_maker() as session:
        # PostgreSQL ON CONFLICT DO UPDATE (UPSERT)
        stmt = insert(Comic).values(
            id=metadata.id,
            slug=metadata.id,
            source_url=metadata.source_url,
            title=metadata.title,
            author=metadata.author,
            description=metadata.description,
            status=metadata.status,
            categories=metadata.categories,
            thumbnail_path=metadata.thumbnail_path
        )
        
        stmt = stmt.on_conflict_do_update(
            index_elements=['id'],
            set_=dict(
                source_url=stmt.excluded.source_url,
                slug=stmt.excluded.slug,
                title=stmt.excluded.title,
                author=stmt.excluded.author,
                description=stmt.excluded.description,
                status=stmt.excluded.status,
                categories=stmt.excluded.categories,
                thumbnail_path=stmt.excluded.thumbnail_path,
                updated_at=datetime.utcnow()
            )
        ).returning(Comic.id)
        
        result = await session.execute(stmt)
        
        internal_id = result.scalar_one()
        
        # Insert a root task for comic worker
        task_id = str(uuid.uuid4())
        workflow_id = activity.info().workflow_id
        await session.execute(
            insert(WorkerTask).values(
                id=task_id,
                workflow_id=workflow_id,
                target_type="comic",
                target_url=metadata.source_url,
                status="completed"
            )
        )
        
        # Asset tracking for Logo/Thumbnail
        assets_to_track = []
        if metadata.thumbnail_path:
            assets_to_track.append({
                "id": f"{internal_id}-thumb",
                "comic_id": internal_id,
                "asset_type": "thumbnail",
                "source_url": metadata.thumbnail_path,
                "order_index": 0.0
            })
        if metadata.logo_path:
            assets_to_track.append({
                "id": f"{internal_id}-logo",
                "comic_id": internal_id,
                "asset_type": "logo",
                "source_url": metadata.logo_path,
                "order_index": 0.0
            })
            
        for asset_data in assets_to_track:
            await session.execute(
                insert(Asset).values(
                    **asset_data,
                    status="pending"
                ).on_conflict_do_update(
                    index_elements=['id'],
                    set_={"source_url": asset_data["source_url"], "updated_at": datetime.utcnow()}
                )
            )
        
        # Management Table: worker_comics
        latest_chap_num = None
        if metadata.chapters:
            try:
                latest_chap_num = float(metadata.chapters[0].chapter_number)
            except:
                pass

        await session.execute(
            insert(WorkerComic).values(
                id=internal_id,
                source_url=metadata.source_url,
                status="completed",
                chapter_count=float(len(metadata.chapters)),
                latest_chapter_number=latest_chap_num,
                last_sync_at=datetime.utcnow()
            ).on_conflict_do_update(
                index_elements=['id'],
                set_=dict(
                    status="completed",
                    chapter_count=float(len(metadata.chapters)),
                    latest_chapter_number=latest_chap_num,
                    last_sync_at=datetime.utcnow()
                )
            )
        )
            
        await session.commit()
        logger.info("Comic upsert completed", internal_id=internal_id)
        return {
            "internal_id": internal_id,
            "asset_ids": [a["id"] for a in assets_to_track]
        }

@activity.defn
async def check_comic_update(metadata: ComicMetadata) -> list[ChapterInfo]:
    logger.info("check_comic_update started", slug=metadata.id)
    new_chapters = []
    async with async_session_maker() as session:
        # Fetch already known chapters for this comic
        q = await session.execute(
            select(WorkerChapter.id).where(WorkerChapter.comic_id == metadata.id)
        )
        known_chapter_ids = set(q.scalars().all())
        
        # Filter metadata.chapters for ones NOT in known_chapter_ids
        for chapter in metadata.chapters:
            if chapter.id not in known_chapter_ids:
                new_chapters.append(chapter)
                
    logger.info("check_comic_update finished", total=len(metadata.chapters), new=len(new_chapters))
    return new_chapters

import os
import aiohttp
import uuid
from datetime import datetime
from temporalio import activity
from db.database import async_session_maker
from db.models import Chapter, WorkerTask, Asset, WorkerChapter
from models.comic_models import ChapterInfo, AssetMetadata
from utils.http_client import fetch_html, get_random_headers
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import select, update
import aiofiles
from parsers.factory import get_parser
from core.logger import logger

STORAGE_DATA_PATH = os.getenv("STORAGE_DATA_PATH", "/storage_data")

@activity.defn
async def fetch_and_parse_chapter(source_url: str) -> list[str]:
    logger.info("fetch_and_parse_chapter started", url=source_url)
    parser = get_parser(source_url)
    html = await fetch_html(source_url)
    image_list = parser.parse_chapter_images(html, source_url)
    logger.info("Chapter parsing completed", count=len(image_list))
    return image_list

@activity.defn(name="download_chapter_assets")
async def download_chapter_assets(asset_ids: list[str]) -> list[dict]:
    logger.info("download_chapter_assets started", count=len(asset_ids))
    
    results = []
    async with async_session_maker() as session:
        # Fetch asset details
        q = await session.execute(select(Asset).where(Asset.id.in_(asset_ids)))
        assets = q.scalars().all()
        
        async with aiohttp.ClientSession() as http_session:
            for asset in assets:
                # Add a small delay to avoid rate limiting
                import asyncio
                await asyncio.sleep(0.5)
                
                # Standard path: storage_data/{slug}/chapters/{num}/{idx}.jpg
                # comic_id is slug, chapter_id often contains num
                # For safety, let's use a simpler structure if num is complex
                filename = f"{int(asset.order_index):04d}.jpg"
                
                # Check if it's a chapter image or comic asset
                if asset.chapter_id:
                    # Parse chapter num from slug or use a generic 'c' prefix
                    chap_folder = asset.chapter_id.split('-')[-1]
                    relative_dir = os.path.join(asset.comic_id, "chapters", chap_folder)
                    referer = asset.source_url # Fallback if we don't have chapter page URL
                else:
                    relative_dir = os.path.join(asset.comic_id, asset.asset_type + "s")
                    referer = "https://hentaivn.ch/truyen/" + asset.comic_id + "/"
                
                target_dir = os.path.join(STORAGE_DATA_PATH, relative_dir)
                os.makedirs(target_dir, exist_ok=True)
                
                file_path = os.path.join(target_dir, filename)
                relative_storage_path = os.path.join(relative_dir, filename)
                
                try:
                    logger.info("Downloading asset", id=asset.id, url=asset.source_url)
                    headers = get_random_headers(referer=referer, is_image=True)
                    async with http_session.get(asset.source_url, headers=headers) as response:
                        if response.status == 200:
                            async with aiofiles.open(file_path, mode='wb') as f:
                                await f.write(await response.read())
                            
                            await session.execute(
                                update(Asset).where(Asset.id == asset.id).values(
                                    storage_path=relative_storage_path,
                                    status="downloaded",
                                    updated_at=datetime.utcnow()
                                )
                            )
                            # Update worker_chapter status to downloaded if it matches
                            if asset.chapter_id:
                                await session.execute(
                                    update(WorkerChapter).where(WorkerChapter.id == asset.chapter_id).values(
                                        status="downloaded",
                                        last_sync_at=datetime.utcnow()
                                    )
                                )
                            results.append({"id": asset.id, "path": relative_storage_path})
                            logger.info("Asset downloaded successfully", id=asset.id, path=relative_storage_path)
                        else:
                            logger.error("Failed to download asset", id=asset.id, status=response.status)
                            await session.execute(update(Asset).where(Asset.id == asset.id).values(status="failed"))
                except Exception as e:
                    logger.error("Error downloading asset", id=asset.id, exc_info=e)
                    await session.execute(update(Asset).where(Asset.id == asset.id).values(status="failed"))
        
        await session.commit()
                
    return results

@activity.defn
async def upsert_chapter_in_db(chapter_info: ChapterInfo, internal_comic_id: str, image_urls: list[str]) -> list[str]:
    logger.info("upsert_chapter_in_db started", chapter=chapter_info.chapter_number)
    asset_ids = []
    async with async_session_maker() as session:
        # 1. Update Chapter Base Info
        # 'images' will now store the asset IDs for sequential lookup
        # We'll generate the IDs based on slug chapter + index
        chapter_slug = chapter_info.id
        
        # Prepare asset records for later
        asset_stmt_list = []
        for idx, img_url in enumerate(image_urls, 1):
            asset_id = f"{chapter_slug}-p{idx}"
            asset_ids.append(asset_id)
            asset_stmt_list.append({
                "id": asset_id,
                "comic_id": internal_comic_id,
                "chapter_id": chapter_slug,
                "asset_type": "manga-page",
                "source_url": img_url,
                "order_index": float(idx),
                "status": "pending"
            })

        # 1. Upsert Chapter FIRST with asset IDs reference
        stmt_chap = insert(Chapter).values(
            id=chapter_slug,
            comic_id=internal_comic_id,
            chapter_number=chapter_info.chapter_number,
            order_index=chapter_info.order_index,
            source_url=chapter_info.source_url,
            images=asset_ids  # Storing as list of asset PKs
        )
        
        stmt_chap = stmt_chap.on_conflict_do_update(
            index_elements=['id'],
            set_=dict(
                images=stmt_chap.excluded.images,
                updated_at=datetime.utcnow()
            )
        )
        await session.execute(stmt_chap)

        # 2. Upsert Assets (FK constraint now satisfied)
        for asset_data in asset_stmt_list:
            await session.execute(
                insert(Asset).values(**asset_data).on_conflict_do_update(
                    index_elements=['id'],
                    set_={"source_url": asset_data["source_url"], "updated_at": datetime.utcnow()}
                )
            )

        # Management Table: worker_chapters
        try:
            chap_num = float(chapter_info.chapter_number)
        except:
            chap_num = 0.0

        await session.execute(
            insert(WorkerChapter).values(
                id=chapter_slug,
                comic_id=internal_comic_id,
                chapter_number=chap_num,
                source_url=chapter_info.source_url,
                status="extracted",
                last_sync_at=datetime.utcnow()
            ).on_conflict_do_update(
                index_elements=['id'],
                set_=dict(
                    status="extracted",
                    last_sync_at=datetime.utcnow()
                )
            )
        )
        
        # Log to worker_tasks
        task_id = f"task-{chapter_slug}"
        workflow_id = activity.info().workflow_id
        await session.execute(
            insert(WorkerTask).values(
                id=task_id,
                workflow_id=workflow_id,
                target_type="chapter",
                target_url=chapter_info.source_url,
                status="completed"
            ).on_conflict_do_update(
                index_elements=['id'],
                set_={"status": "completed", "updated_at": datetime.utcnow()}
            )
        )
        
        await session.commit()
        logger.info("upsert_chapter_in_db done", count=len(asset_ids))
        return asset_ids

@activity.defn
async def fetch_chapter_assets(chapter_id: str) -> list[str]:
    logger.info("fetch_chapter_assets started", chapter_id=chapter_id)
    async with async_session_maker() as session:
        q = await session.execute(
            select(Asset.id).where(Asset.chapter_id == chapter_id).order_by(Asset.order_index)
        )
        asset_ids = q.scalars().all()
    return list(asset_ids)


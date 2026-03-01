from datetime import timedelta
from temporalio import workflow
from models.comic_models import ChapterInfo

with workflow.unsafe.imports_passed_through():
    from activities.chapter_activities import (
        fetch_and_parse_chapter,
        download_images,
        upsert_chapter_in_db,
        fetch_chapter_assets
    )

@workflow.defn
class ChapterScraperWorkflow:
    @workflow.run
    async def run(self, chapter_info: ChapterInfo, internal_comic_id: str, only_img: bool = False) -> str:
        asset_ids = []
        
        if not only_img:
            # 1. Fetch Chapter HTML and Extract Image URLs
            image_urls = await workflow.execute_activity(
                fetch_and_parse_chapter,
                chapter_info.source_url,
                start_to_close_timeout=timedelta(minutes=2)
            )
            
            if not image_urls:
                raise Exception(f"No images found for chapter {chapter_info.source_url}")
                
            # 2. Upsert Metadata into Database (Stage 1: Extraction)
            asset_ids = await workflow.execute_activity(
                upsert_chapter_in_db,
                args=[chapter_info, internal_comic_id, image_urls],
                start_to_close_timeout=timedelta(minutes=2)
            )
        else:
            # If only_img, fetch assets from DB for this chapter
            asset_ids = await workflow.execute_activity(
                fetch_chapter_assets,
                chapter_info.id,
                start_to_close_timeout=timedelta(minutes=2)
            )
            
        # 3. Download Images to Local Volume (Stage 2: Persistence)
        if asset_ids:
            await workflow.execute_activity(
                download_images,
                args=[asset_ids],
                start_to_close_timeout=timedelta(minutes=10)
            )
        
        return chapter_info.id

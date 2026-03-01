from datetime import timedelta
from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from models.comic_models import ComicMetadata
    from activities.comic_activities import (
        fetch_and_parse_comic, 
        upsert_comic_in_db,
        check_comic_update
    )

@workflow.defn
class ComicScraperWorkflow:
    @workflow.run
    async def run(self, source_url: str, only_img: bool = False) -> str:
        with workflow.unsafe.imports_passed_through():
            from activities.chapter_activities import download_images

        # 1. Fetch and Parse Comic Page
        comic_meta: ComicMetadata = await workflow.execute_activity(
            fetch_and_parse_comic,
            source_url,
            start_to_close_timeout=timedelta(minutes=2)
        )
        
        # 2. Upsert Comic to Database (Register Assets)
        upsert_result = await workflow.execute_activity(
            upsert_comic_in_db,
            args=[comic_meta],
            start_to_close_timeout=timedelta(minutes=1)
        )
        internal_comic_id = upsert_result["internal_id"]
        comic_asset_ids = upsert_result["asset_ids"]

        # 3. Check for NEW Chapters
        chapters_to_crawl = await workflow.execute_activity(
            check_comic_update,
            args=[comic_meta],
            start_to_close_timeout=timedelta(minutes=1)
        )

        # 4. Download Comic Assets (Logo, Thumbnail)
        if comic_asset_ids:
            await workflow.execute_activity(
                download_images,
                args=[comic_asset_ids],
                start_to_close_timeout=timedelta(minutes=5)
            )
        
        # 5. Trigger Chapter Workflows (Child Workflows)
        from temporalio.workflow import ParentClosePolicy
        
        for chapter in chapters_to_crawl:
            await workflow.execute_child_workflow(
                "ChapterScraperWorkflow",
                args=[chapter, internal_comic_id, only_img],
                id=f"chapter-{internal_comic_id}-{chapter.chapter_number}",
                parent_close_policy=ParentClosePolicy.ABANDON
            )

        return internal_comic_id

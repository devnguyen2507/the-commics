import asyncio
import os
from temporalio.client import Client
from temporalio.worker import Worker

# Import activities
from activities.comic_activities import fetch_and_parse_comic, upsert_comic_in_db, check_comic_update
from activities.chapter_activities import (
    fetch_and_parse_chapter, 
    download_images, 
    upsert_chapter_in_db,
    fetch_chapter_assets
)

# Import workflows
from workflows.comic_workflows import ComicScraperWorkflow
from workflows.chapter_workflows import ChapterScraperWorkflow

# DB Init
from db.database import init_db

async def main():
    print("Initialize Database tables...")
    await init_db()

    temporal_host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    print(f"Connecting to Temporal on {temporal_host}...")
    
    # Wait for temporal to come up
    client = None
    for _ in range(30):
        try:
            client = await Client.connect(temporal_host)
            break
        except Exception:
            await asyncio.sleep(1)
            
    if not client:
        raise Exception("Failed to connect to Temporal server.")

    worker = Worker(
        client,
        task_queue="crawler-task-queue",
        workflows=[ComicScraperWorkflow, ChapterScraperWorkflow],
        activities=[
            fetch_and_parse_comic, 
            upsert_comic_in_db,
            check_comic_update,
            fetch_and_parse_chapter,
            download_images,
            upsert_chapter_in_db,
            fetch_chapter_assets
        ],
    )
    
    print("Worker started. Listening on crawler-task-queue...")
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import os
import sys
from temporalio.client import Client
from db.database import async_session_maker
from db.models import Comic
from sqlalchemy import select
from workflows.comic_workflows import ComicScraperWorkflow

async def bulk_sync(only_img: bool = False):
    # Inside container, temporal host info
    temporal_host = os.getenv("TEMPORAL_HOST", "temporal:7233")
    client = await Client.connect(temporal_host)
    
    async with async_session_maker() as session:
        q = await session.execute(select(Comic.id, Comic.source_url).order_by(Comic.id))
        comics = q.all()
        
    print(f"Found {len(comics)} comics in database. Starting bulk sync...")
    
    for slug, source_url in comics:
        workflow_id = f"pull-crawl-{slug}"
        print(f"Triggering sync for: {slug} ({source_url})")
        try:
            # We use start_workflow to not wait for each one to finish (async triggering)
            await client.start_workflow(
                ComicScraperWorkflow.run,
                args=[source_url, only_img],
                id=workflow_id,
                task_queue="crawler-task-queue"
            )
            print(f"  [OK] Triggered {slug}")
        except Exception as e:
            if "already started" in str(e).lower():
                print(f"  [SKIP] {slug} is already running.")
            else:
                print(f"  [ERROR] Failed to trigger {slug}: {e}")

if __name__ == "__main__":
    only_img_val = False
    if len(sys.argv) > 1:
        only_img_val = sys.argv[1].lower() in ("true", "1", "yes")
        
    asyncio.run(bulk_sync(only_img_val))

import asyncio
import os
import sys
from temporalio.client import Client
from workflows.comic_workflows import ComicScraperWorkflow

async def pull_comic(slug: str, only_img: bool = False):
    # Inside container, temporal host info
    temporal_host = os.getenv("TEMPORAL_HOST", "temporal:7233")
    client = await Client.connect(temporal_host)
    
    full_url = f"https://hentaivn.ch/truyen/{slug}/"
    workflow_id = f"pull-crawl-{slug}"
    
    print(f"Triggering sync for: {full_url} (only_img={only_img})")
    try:
        # Start workflow and wait for completion
        result = await client.execute_workflow(
            ComicScraperWorkflow.run,
            args=[full_url, only_img],
            id=workflow_id,
            task_queue="crawler-task-queue"
        )
        print(f"Sync workflow completed for {slug}. Internal ID: {result}")
        print("Chapters are being processed in the background.")
    except Exception as e:
        print(f"Failed to trigger sync for {slug}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pull_trigger.py <slug> [only_img]")
        sys.exit(1)
    
    comic_slug = sys.argv[1].strip("/")
    only_img_val = False
    if len(sys.argv) > 2:
        only_img_val = sys.argv[2].lower() in ("true", "1", "yes")
        
    asyncio.run(pull_comic(comic_slug, only_img_val))

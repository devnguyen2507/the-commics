#!/bin/bash

# Default comic if no argument is provided
TARGET_URL=${1:-"https://hentaivn.ch/truyen/21966-2-choukyou-shoki-koitaka-ruki/"}

echo "Triggering ComicScraperWorkflow for URL: $TARGET_URL"

# Generate a workflow ID based on timestamp
WORKFLOW_ID="comic-scraper-$(date +%s)"

# Make sure we use the temporal container to trigger the workflow.
# Wrap the URL directly in JSON quotes for the input argument.
docker exec docker-temporal-1 temporal workflow start \
    --type ComicScraperWorkflow \
    --task-queue crawler-task-queue \
    --workflow-id "$WORKFLOW_ID" \
    --input "\"$TARGET_URL\""

echo "Workflow started! Check Temporal UI at http://localhost:8081"

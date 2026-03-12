-- Migration: Sync is_published from comics to seo_contents
BEGIN;

UPDATE seo_contents s
SET is_published = c.is_publish
FROM comics c
WHERE s.entity_type = 'comic'
  AND s.entity_id = c.id::text;

COMMIT;

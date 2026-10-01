-- Keep the unconfirmed First General Body Meeting off the public event list.
-- The officer can republish it after its schedule is confirmed.
UPDATE events
   SET publication_status = 'draft',
       version = version + 1,
       updated_at = clock_timestamp()
 WHERE id = 'b978ce11-0e75-4e1d-91cb-5fb6fd327002'
   AND title = 'First General Body Meeting'
   AND publication_status = 'published'
   AND starts_at IS NULL
   AND ends_at IS NULL;

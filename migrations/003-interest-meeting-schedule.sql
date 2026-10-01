-- Confirmed schedule supplied September 30, 2026; venue confirmed October 1.
-- Keep registration closed until an officer explicitly opens it.
UPDATE events
   SET starts_at = TIMESTAMPTZ '2026-10-15 18:30:00-04:00',
       ends_at = TIMESTAMPTZ '2026-10-15 19:30:00-04:00',
       timing_label = 'Thu, Oct 15, 2026 · 6:30–7:30 PM EDT',
       location = 'Instructional Center (IC), Room 115',
       version = version + 1,
       updated_at = clock_timestamp()
 WHERE id = 'b978ce11-0e75-4e1d-91cb-5fb6fd327001'
   AND title = 'Fall 2026 Interest Meeting'
   AND starts_at IS NULL
   AND ends_at IS NULL;

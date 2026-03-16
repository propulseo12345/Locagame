-- Fix: ensure one delivery_task per reservation (single source of truth)
-- Previously, multiple tasks could be created for the same reservation,
-- causing inconsistencies between the Reservations and Planning pages.

-- Add unique partial index: one task per reservation_id (allows nulls)
CREATE UNIQUE INDEX IF NOT EXISTS delivery_tasks_unique_reservation
ON delivery_tasks (reservation_id)
WHERE reservation_id IS NOT NULL;

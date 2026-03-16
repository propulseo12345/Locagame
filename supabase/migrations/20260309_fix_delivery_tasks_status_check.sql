-- Fix: delivery_tasks status CHECK constraint was missing statuses used by the app
-- Old constraint: scheduled, in_progress, completed, cancelled
-- New constraint: scheduled, assigned, en_route, delivered, completed, cancelled
-- This caused 400 errors when assigning a technician (status = 'assigned')

ALTER TABLE public.delivery_tasks DROP CONSTRAINT IF EXISTS delivery_tasks_status_check;
ALTER TABLE public.delivery_tasks ADD CONSTRAINT delivery_tasks_status_check
  CHECK (status = ANY (ARRAY['scheduled', 'assigned', 'en_route', 'delivered', 'completed', 'cancelled']));

-- Rename reference_id column to reference_mobile_number in submissions table
ALTER TABLE public.submissions 
RENAME COLUMN reference_id TO reference_mobile_number;
-- Run this in Supabase SQL editor to add the new column
ALTER TABLE fsyp_children ADD COLUMN IF NOT EXISTS sweets_image_url text;

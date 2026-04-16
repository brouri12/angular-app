-- Fix the foreign key constraint issue for teacher_id in student_groups table
-- Run this in phpMyAdmin or MySQL Workbench

USE wordly_planification;

-- Drop the foreign key constraint
ALTER TABLE student_groups DROP FOREIGN KEY FKt36ekai0ogsc5t4kex8tjxs9x;

-- Now teacher_id can reference any user ID without constraint
-- The column still exists, just without the foreign key

SELECT 'Foreign key constraint removed successfully!' AS status;

-- 将 profiles 表的 dealership_id 字段改为可空
ALTER TABLE profiles 
ALTER COLUMN dealership_id DROP NOT NULL;
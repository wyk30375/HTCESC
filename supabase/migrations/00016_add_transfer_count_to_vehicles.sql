-- 在 vehicles 表添加过户次数字段
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS transfer_count INTEGER DEFAULT 0;

-- 添加注释
COMMENT ON COLUMN vehicles.transfer_count IS '过户次数';
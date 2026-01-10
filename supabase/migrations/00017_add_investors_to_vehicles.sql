-- 在 vehicles 表添加押车出资人和地租出资人字段
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS investor_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rent_investor_ids JSONB DEFAULT '[]'::jsonb;

-- 添加注释
COMMENT ON COLUMN vehicles.investor_ids IS '押车出资人ID列表';
COMMENT ON COLUMN vehicles.rent_investor_ids IS '地租出资人ID列表';
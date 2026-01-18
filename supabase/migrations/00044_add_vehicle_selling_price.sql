-- 添加车辆预售报价字段
-- 用于在公共展示页面显示售价

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS selling_price NUMERIC(12, 2);

-- 添加字段注释
COMMENT ON COLUMN vehicles.selling_price IS '预售报价（对外展示价格）';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_vehicles_selling_price ON vehicles(selling_price) WHERE selling_price IS NOT NULL;
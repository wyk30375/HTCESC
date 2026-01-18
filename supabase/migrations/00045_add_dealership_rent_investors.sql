-- 在dealerships表添加场地老板ID列表字段
-- 场地老板在提成规则设置页面统一配置，不再在车辆入库时单独选择

ALTER TABLE dealerships
  ADD COLUMN IF NOT EXISTS rent_investor_ids TEXT[];

-- 添加字段注释
COMMENT ON COLUMN dealerships.rent_investor_ids IS '场地老板ID列表（在提成规则设置页面配置）';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_dealerships_rent_investor_ids ON dealerships USING GIN(rent_investor_ids);
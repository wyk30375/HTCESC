-- 添加总成本字段到 vehicle_sales 表
ALTER TABLE vehicle_sales
ADD COLUMN IF NOT EXISTS total_cost NUMERIC DEFAULT 0;

-- 添加注释
COMMENT ON COLUMN vehicle_sales.total_cost IS '总成本（购车款+整备费+过户费+杂费+销售整备费+销售过户费+销售杂费）';

-- 更新现有记录的 total_cost（如果有的话）
-- 这里暂时设置为 0，实际值需要在创建销售记录时计算
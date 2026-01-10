-- 更新所有现有销售记录的 total_cost
-- total_cost = 车辆入库成本 + 销售整备费 + 销售过户费 + 销售杂费
UPDATE vehicle_sales vs
SET total_cost = (
  -- 获取车辆入库成本
  SELECT COALESCE(SUM(vc.amount), 0)
  FROM vehicle_costs vc
  WHERE vc.vehicle_id = vs.vehicle_id
) + COALESCE(vs.sale_preparation_cost, 0) + COALESCE(vs.sale_transfer_cost, 0) + COALESCE(vs.sale_misc_cost, 0)
WHERE vs.total_cost = 0 OR vs.total_cost IS NULL;

-- 添加注释说明
COMMENT ON COLUMN vehicle_sales.total_cost IS '总成本（车辆入库成本+销售整备费+销售过户费+销售杂费）';
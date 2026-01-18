-- 添加车辆涡轮增压标识字段
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_turbo BOOLEAN DEFAULT false;

COMMENT ON COLUMN vehicles.is_turbo IS '是否涡轮增压发动机（true=涡轮T，false=自然吸气L）';
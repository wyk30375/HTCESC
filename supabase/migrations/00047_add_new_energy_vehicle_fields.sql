-- 扩展燃料类型枚举，添加增程式
ALTER TYPE fuel_type ADD VALUE IF NOT EXISTS 'erev';

-- 添加新能源车专用字段
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS battery_capacity NUMERIC(5,1);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS endurance_range INTEGER;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS motor_power NUMERIC(6,1);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS motor_torque NUMERIC(6,1);

-- 添加字段注释
COMMENT ON COLUMN vehicles.battery_capacity IS '电池容量（kWh）';
COMMENT ON COLUMN vehicles.endurance_range IS '续航里程（km，NEDC/CLTC工况）';
COMMENT ON COLUMN vehicles.motor_power IS '电机功率（kW）';
COMMENT ON COLUMN vehicles.motor_torque IS '电机扭矩（N·m）';
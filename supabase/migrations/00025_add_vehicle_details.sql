-- 完善车辆基本资料详情参数
-- 添加更详细的二手车信息字段

-- 添加车辆类型枚举
DO $$ BEGIN
  CREATE TYPE vehicle_type AS ENUM ('sedan', 'suv', 'mpv', 'coupe', 'hatchback', 'pickup', 'van', 'sports');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 添加变速箱类型枚举
DO $$ BEGIN
  CREATE TYPE transmission_type AS ENUM ('manual', 'automatic', 'cvt', 'dct', 'amt');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 添加驱动方式枚举
DO $$ BEGIN
  CREATE TYPE drive_type AS ENUM ('fwd', 'rwd', 'awd', '4wd');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 添加燃料类型枚举
DO $$ BEGIN
  CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid', 'phev');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 添加排放标准枚举
DO $$ BEGIN
  CREATE TYPE emission_standard AS ENUM ('national_3', 'national_4', 'national_5', 'national_6a', 'national_6b');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 添加新字段到 vehicles 表
ALTER TABLE vehicles
  -- 基本识别信息
  ADD COLUMN IF NOT EXISTS vin_full TEXT,
  ADD COLUMN IF NOT EXISTS engine_number TEXT,
  
  -- 车辆基本信息
  ADD COLUMN IF NOT EXISTS vehicle_type vehicle_type,
  
  -- 车辆技术参数
  ADD COLUMN IF NOT EXISTS displacement NUMERIC(3, 1), -- 排量（升）
  ADD COLUMN IF NOT EXISTS transmission_type transmission_type,
  ADD COLUMN IF NOT EXISTS drive_type drive_type,
  ADD COLUMN IF NOT EXISTS fuel_type fuel_type,
  ADD COLUMN IF NOT EXISTS emission_standard emission_standard,
  ADD COLUMN IF NOT EXISTS seats INTEGER DEFAULT 5,
  
  -- 车辆外观
  ADD COLUMN IF NOT EXISTS exterior_color TEXT,
  ADD COLUMN IF NOT EXISTS interior_color TEXT,
  
  -- 车辆状态
  ADD COLUMN IF NOT EXISTS is_accident BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_flooded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_fire BOOLEAN DEFAULT false,
  
  -- 证件信息
  ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
  ADD COLUMN IF NOT EXISTS inspection_expiry DATE,
  
  -- 价格信息
  ADD COLUMN IF NOT EXISTS original_price NUMERIC(12, 2); -- 新车指导价

-- 添加字段注释
COMMENT ON COLUMN vehicles.vin_full IS '完整车架号（VIN）';
COMMENT ON COLUMN vehicles.engine_number IS '发动机号';
COMMENT ON COLUMN vehicles.vehicle_type IS '车辆类型';
COMMENT ON COLUMN vehicles.displacement IS '排量（升）';
COMMENT ON COLUMN vehicles.transmission_type IS '变速箱类型';
COMMENT ON COLUMN vehicles.drive_type IS '驱动方式';
COMMENT ON COLUMN vehicles.fuel_type IS '燃料类型';
COMMENT ON COLUMN vehicles.emission_standard IS '排放标准';
COMMENT ON COLUMN vehicles.seats IS '座位数';
COMMENT ON COLUMN vehicles.exterior_color IS '车身颜色';
COMMENT ON COLUMN vehicles.interior_color IS '内饰颜色';
COMMENT ON COLUMN vehicles.is_accident IS '是否事故车';
COMMENT ON COLUMN vehicles.is_flooded IS '是否泡水车';
COMMENT ON COLUMN vehicles.is_fire IS '是否火烧车';
COMMENT ON COLUMN vehicles.insurance_expiry IS '保险到期日';
COMMENT ON COLUMN vehicles.inspection_expiry IS '年检到期日';
COMMENT ON COLUMN vehicles.original_price IS '新车指导价';

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_vehicles_vin_full ON vehicles(vin_full);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type ON vehicles(fuel_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_accident ON vehicles(is_accident);

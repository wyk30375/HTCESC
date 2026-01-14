-- 删除旧的 status 约束
ALTER TABLE dealerships DROP CONSTRAINT IF EXISTS dealerships_status_check;

-- 创建新的 status 约束，包含 pending 和 rejected 状态
ALTER TABLE dealerships 
ADD CONSTRAINT dealerships_status_check 
CHECK (status IN ('active', 'inactive', 'pending', 'rejected'));
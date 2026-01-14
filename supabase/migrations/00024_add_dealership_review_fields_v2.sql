-- 为 dealerships 表添加审核相关字段
ALTER TABLE dealerships
ADD COLUMN IF NOT EXISTS business_license TEXT,
ADD COLUMN IF NOT EXISTS province VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(50),
ADD COLUMN IF NOT EXISTS district VARCHAR(50),
ADD COLUMN IF NOT EXISTS rejected_reason TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);

-- 更新 status 字段的注释
COMMENT ON COLUMN dealerships.status IS '车行状态: pending-待审核, active-已激活, inactive-已停用, rejected-审核拒绝';

-- 创建营业执照图片存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-8u0242wc45c1_business_license_images', 'business_license_images', true)
ON CONFLICT (id) DO NOTHING;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "允许已认证用户上传营业执照" ON storage.objects;
DROP POLICY IF EXISTS "允许所有人查看营业执照" ON storage.objects;
DROP POLICY IF EXISTS "允许已认证用户删除营业执照" ON storage.objects;

-- 设置存储桶策略：允许已认证用户上传
CREATE POLICY "允许已认证用户上传营业执照"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-8u0242wc45c1_business_license_images');

-- 设置存储桶策略：允许所有人查看营业执照
CREATE POLICY "允许所有人查看营业执照"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-8u0242wc45c1_business_license_images');

-- 设置存储桶策略：允许已认证用户删除自己上传的文件
CREATE POLICY "允许已认证用户删除营业执照"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-8u0242wc45c1_business_license_images');

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_dealerships_status ON dealerships(status);
CREATE INDEX IF NOT EXISTS idx_dealerships_province_city ON dealerships(province, city);
CREATE INDEX IF NOT EXISTS idx_dealerships_reviewed_at ON dealerships(reviewed_at);
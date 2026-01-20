
-- 添加身份证照片字段到 profiles 表
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS id_card_front_photo TEXT,
ADD COLUMN IF NOT EXISTS id_card_back_photo TEXT;

-- 创建员工身份证照片存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee_id_cards', 'employee_id_cards', true)
ON CONFLICT (id) DO NOTHING;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "允许认证用户上传身份证照片" ON storage.objects;
DROP POLICY IF EXISTS "允许所有人查看身份证照片" ON storage.objects;
DROP POLICY IF EXISTS "允许认证用户删除身份证照片" ON storage.objects;

-- 设置存储桶策略：允许认证用户上传和查看
CREATE POLICY "允许认证用户上传身份证照片"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee_id_cards');

CREATE POLICY "允许所有人查看身份证照片"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee_id_cards');

CREATE POLICY "允许认证用户删除身份证照片"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'employee_id_cards');

-- 添加注释
COMMENT ON COLUMN profiles.id_card_front_photo IS '员工身份证正面照片URL';
COMMENT ON COLUMN profiles.id_card_back_photo IS '员工身份证反面照片URL';

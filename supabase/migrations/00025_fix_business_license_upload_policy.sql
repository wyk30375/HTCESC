-- 删除旧的上传策略
DROP POLICY IF EXISTS "允许已认证用户上传营业执照" ON storage.objects;

-- 创建新策略：允许所有人（包括匿名用户）上传营业执照
CREATE POLICY "允许所有人上传营业执照"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'app-8u0242wc45c1_business_license_images');

-- 更新删除策略：允许所有人删除（因为注册时可能需要重新上传）
DROP POLICY IF EXISTS "允许已认证用户删除营业执照" ON storage.objects;

CREATE POLICY "允许所有人删除营业执照"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'app-8u0242wc45c1_business_license_images');
-- 创建车辆图片存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app_8u0242wc45c1_vehicle_images',
  'app_8u0242wc45c1_vehicle_images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
);

-- 设置存储桶策略：所有人可以查看，管理员可以上传
CREATE POLICY "所有人可以查看车辆图片" ON storage.objects
  FOR SELECT USING (bucket_id = 'app_8u0242wc45c1_vehicle_images');

CREATE POLICY "管理员可以上传车辆图片" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'app_8u0242wc45c1_vehicle_images' AND
    is_admin(auth.uid())
  );

CREATE POLICY "管理员可以更新车辆图片" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'app_8u0242wc45c1_vehicle_images' AND
    is_admin(auth.uid())
  );

CREATE POLICY "管理员可以删除车辆图片" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'app_8u0242wc45c1_vehicle_images' AND
    is_admin(auth.uid())
  );
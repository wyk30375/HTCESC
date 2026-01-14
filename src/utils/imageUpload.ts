import { supabase } from '@/db/supabase';

const BUCKET_NAME = 'app-8u0242wc45c1_business_license_images';
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

/**
 * 压缩图片到指定大小以下
 */
async function compressImage(file: File, maxSize: number = MAX_FILE_SIZE): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // 限制最大分辨率为 1080p
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // 尝试不同的质量设置
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'));
                return;
              }

              if (blob.size <= maxSize || quality <= 0.1) {
                // 生成文件名（只包含字母和数字）
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 8);
                const fileName = `license_${timestamp}_${randomStr}.webp`;
                const compressedFile = new File([blob], fileName, {
                  type: 'image/webp',
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/webp',
            quality
          );
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error('图片加载失败'));
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
  });
}

/**
 * 上传营业执照图片
 */
export async function uploadBusinessLicense(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string; compressed: boolean; finalSize: number }> {
  try {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('不支持的文件格式，请上传 JPEG、PNG、GIF、WEBP 或 AVIF 格式的图片');
    }

    let uploadFile = file;
    let compressed = false;

    // 如果文件超过 1MB，自动压缩
    if (file.size > MAX_FILE_SIZE) {
      onProgress?.(10);
      uploadFile = await compressImage(file);
      compressed = true;
      onProgress?.(30);
    } else {
      onProgress?.(20);
    }

    // 生成唯一文件路径
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExt = uploadFile.name.split('.').pop() || 'jpg';
    const filePath = `business-licenses/${timestamp}-${randomStr}.${fileExt}`;

    // 上传到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, uploadFile, {
        cacheControl: '3600',
        upsert: true, // 允许覆盖同名文件
      });

    if (error) {
      throw error;
    }

    onProgress?.(80);

    // 获取公共 URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    onProgress?.(100);

    return {
      url: urlData.publicUrl,
      path: data.path,
      compressed,
      finalSize: uploadFile.size,
    };
  } catch (error: any) {
    console.error('上传营业执照失败:', error);
    throw new Error(error.message || '上传失败，请重试');
  }
}

/**
 * 删除营业执照图片
 */
export async function deleteBusinessLicense(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error('删除营业执照失败:', error);
    throw new Error(error.message || '删除失败，请重试');
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

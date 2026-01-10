import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import { storageApi } from '@/db/api';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 移除文件名字符限制，允许任何字符（包括中文、特殊字符等）
  // 因为上传时会自动生成新的文件名（时间戳 + 随机字符串）

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.8,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      
      // 如果压缩后仍然超过1MB，继续降低质量
      if (compressedFile.size > 1048576) {
        const furtherCompressed = await imageCompression(file, {
          ...options,
          initialQuality: 0.6,
        });
        
        if (furtherCompressed.size > 1048576) {
          toast.warning('图片已压缩至最小，但仍超过1MB限制');
        } else {
          toast.info(`图片已压缩至 ${(furtherCompressed.size / 1024).toFixed(0)}KB`);
        }
        
        return furtherCompressed;
      }
      
      if (compressedFile.size < file.size) {
        toast.info(`图片已自动压缩至 ${(compressedFile.size / 1024).toFixed(0)}KB`);
      }
      
      return compressedFile;
    } catch (error) {
      console.error('图片压缩失败:', error);
      throw new Error('图片压缩失败');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    if (images.length + files.length > maxImages) {
      toast.error(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    setUploading(true);
    setProgress(0);

    const newImages: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} 不是有效的图片文件`);
          continue;
        }

        // 文件名不做限制，因为上传时会自动生成新的文件名

        try {
          // 压缩图片
          const compressedFile = await compressImage(file);

          // 生成唯一文件名
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 8);
          const ext = compressedFile.name.split('.').pop() || 'webp';
          const fileName = `${timestamp}_${randomStr}.${ext}`;

          // 上传到 Supabase Storage
          const publicUrl = await storageApi.uploadVehicleImage(compressedFile, fileName);
          newImages.push(publicUrl);

          // 更新进度
          setProgress(((i + 1) / totalFiles) * 100);
        } catch (error) {
          console.error(`上传 ${file.name} 失败:`, error);
          toast.error(`上传 ${file.name} 失败`);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast.success(`成功上传 ${newImages.length} 张图片`);
      }
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success('已删除图片');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? '上传中...' : '选择图片'}
        </Button>
        <span className="text-sm text-muted-foreground">
          已上传 {images.length}/{maxImages} 张
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">上传进度: {Math.round(progress)}%</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 @md:grid-cols-3 @lg:grid-cols-4">
          {images.map((url, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={url}
                alt={`车辆图片 ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">
            还没有上传图片
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            支持 JPEG、PNG、WEBP、GIF、AVIF 格式，单张图片最大 1MB
          </p>
        </div>
      )}
    </div>
  );
}

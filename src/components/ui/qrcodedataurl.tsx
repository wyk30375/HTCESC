import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeDataUrlProps {
  data: string;
  size?: number;
  className?: string;
}

/**
 * QRCodeDataUrl 组件
 * 使用 qrcode 库生成二维码并显示为图片
 */
export default function QRCodeDataUrl({ data, size = 200, className = '' }: QRCodeDataUrlProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(
        canvasRef.current,
        data,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) {
            console.error('生成二维码失败:', error);
          }
        }
      );
    }
  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

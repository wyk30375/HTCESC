import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Image, 
  Crop, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  Upload, 
  Trash2,
  Move
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface ImageEditorProps {
  imageUrl?: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(imageUrl || null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          imageRef.current = img;
          setSelectedImage(event.target?.result as string);
          setRotation(0);
          setZoom(100);
          setPosition({ x: 0, y: 0 });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedImage) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    imageRef.current = null;
  };

  const handleSave = () => {
    if (!selectedImage || !canvasRef.current) {
      toast({
        title: "Geen afbeelding",
        description: "Upload eerst een afbeelding voordat u deze bewerkt.",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || !imageRef.current) return;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 600;

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom / 100, zoom / 100);
    ctx.translate(-canvas.width / 2 + position.x, -canvas.height / 2 + position.y);

    // Draw image
    ctx.drawImage(
      imageRef.current,
      0,
      0,
      imageRef.current.width,
      imageRef.current.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // Get result
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(dataUrl);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Image className="mr-2 h-5 w-5" />
        Afbeelding Bewerken
      </h2>

      <div className="mb-6">
        {!selectedImage ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="mb-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <p className="mb-4 text-gray-600">Sleep een afbeelding hierheen of klik op de knop hieronder</p>
            <Button asChild>
              <Label htmlFor="image-upload" className="cursor-pointer">
                Afbeelding Uploaden
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </Label>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div 
              className="relative overflow-hidden rounded-lg border border-gray-200 h-[400px] flex justify-center items-center bg-gray-100"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <div className="absolute top-2 right-2 bg-white/80 rounded-md p-1">
                <Move className="h-5 w-5 text-gray-700" />
              </div>
              <img
                src={selectedImage}
                alt="Preview"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                  transformOrigin: 'center',
                  position: 'relative',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Zoom ({zoom}%)</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 50}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 200}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  value={[zoom]}
                  min={50}
                  max={200}
                  step={1}
                  onValueChange={(value) => setZoom(value[0])}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleRotate}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Draaien
                </Button>
                <Button variant="outline" onClick={handleRemoveImage} className="text-red-500 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Verwijderen
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={onCancel}>
                Annuleren
              </Button>
              <Button onClick={handleSave} className="bg-dealership-primary hover:bg-blue-900">
                <Save className="mr-2 h-4 w-4" />
                Opslaan
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Canvas voor het opslaan van de bewerkte afbeelding (verborgen) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageEditor;

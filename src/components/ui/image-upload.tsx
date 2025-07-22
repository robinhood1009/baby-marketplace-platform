import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link, Image, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageUrlChange: (url: string) => void;
  currentImageUrl?: string;
  className?: string;
  bucketName?: string; // Optional bucket name, defaults to 'offer-images'
}

export const ImageUpload = ({ onImageUrlChange, currentImageUrl, className, bucketName = 'offer-images' }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const uploadedUrl = data.publicUrl;
      setPreviewUrl(uploadedUrl);
      onImageUrlChange(uploadedUrl);

      toast({
        title: "Upload successful",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl) {
      setPreviewUrl(imageUrl);
      onImageUrlChange(imageUrl);
      toast({
        title: "Image URL set",
        description: "Image URL has been set successfully"
      });
    }
  };

  const clearImage = () => {
    setPreviewUrl('');
    setImageUrl('');
    onImageUrlChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label>Product Image</Label>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          <TabsTrigger value="url">Image URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-primary/50",
                  isUploading && "pointer-events-none opacity-50"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Drop your image here</p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse (max 5MB)
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Link className="w-4 h-4 text-muted-foreground" />
                <Label>Image URL</Label>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button 
                  type="button" 
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl}
                >
                  Set URL
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {previewUrl && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Image className="w-4 h-4 text-muted-foreground" />
                  <Label>Preview</Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearImage}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative overflow-hidden rounded-lg border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={() => {
                    toast({
                      title: "Image load failed",
                      description: "Unable to load the image. Please check the URL.",
                      variant: "destructive"
                    });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
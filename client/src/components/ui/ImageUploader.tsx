import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import api, { getImageUrl } from '../../api/client';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  type: 'country' | 'city' | 'shuttle';
  label?: string;
}

export function ImageUploader({ value, onChange, type, label }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value ? getImageUrl(value) : null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP');
      return;
    }

    setError(null);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onChange(response.data.url);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al subir la imagen');
      setPreview(value ? getImageUrl(value) : null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await api.delete('/upload/image', { data: { url: value } });
      } catch {
        console.error('Error deleting image from server');
      }
    }
    setPreview(null);
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        id={`upload-${type}`}
      />

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              ) : (
                <Upload className="w-4 h-4 text-slate-600" />
              )}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor={`upload-${type}`}
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
          ) : (
            <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {uploading ? 'Subiendo...' : 'Click para subir imagen'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            JPG, PNG o WEBP (máx 5MB)
          </span>
        </label>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

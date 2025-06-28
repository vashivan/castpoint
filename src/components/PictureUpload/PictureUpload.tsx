import { useAuth } from '../../context/AuthContext';
import React, { useState, useRef } from 'react';

type Props = {
  pic_url: string;
  pic_public_id: string;
  onChange: (val: { url: string; public_id: string }) => void;
};

const CLOUD_NAME = process.env.CLOUD_NAME;
const UPLOAD_PRESET = process.env.UPLOAD_PRESET;

export default function PictureUploader({ onChange, pic_url, pic_public_id }: Props) {
  const [imageUrl, setImageUrl] = useState(pic_url || '');
  const [publicId, setPublicId] = useState(pic_public_id || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setIsLoading(true);
  
    if (publicId) {
      await deletePreviousImage(publicId);
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', `${UPLOAD_PRESET}`);
  
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
  
      const data = await res.json();
      onChange({ url: data.secure_url, public_id: data.public_id });
      setImageUrl(data.secure_url);
      setPublicId(data.public_id);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const deletePreviousImage = async (publicId: string) => {
    try {
      const res = await fetch('/api/delete_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setImageUrl('');
        setPublicId('');
        onChange({ url: '', public_id: '' });
  
      } else {
        console.error('Failed to delete image:', data.error);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };
  

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-white text-l">Upload your profile picture here:</p>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-gray-400/60 text-white rounded-md shadow hover:bg-gray-400/80 cursor-pointer transition"
      >
        {isLoading ? <p>Uploading...</p> : <p>Upload Photo</p>}
      </button>

      {imageUrl && (
        <div className="text-center">
          <p className="text-sm text-white mb-2">Uploaded image:</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            className="w-48 h-48 object-cover rounded-lg shadow"
          />
          <button
            className="mt-3 px-3 py-1 text-red-500 bg-red-300 rounded-md cursor-pointer"
            onClick={() => deletePreviousImage(publicId)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

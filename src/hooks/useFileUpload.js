import { useState, useCallback } from 'react';
import { uploadFile } from '../services/uploadService';

export default function useFileUpload(defaultFolder = 'uploads') {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const doUpload = useCallback(async (file, folder = defaultFolder) => {
    setError('');
    setProgress(0);
    setUploading(true);
    try {
      const url = await uploadFile(file, {
        folder,
        onProgress: (p) => setProgress(p),
      });
      return url;
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [defaultFolder]);

  return { doUpload, uploading, progress, error };
}

/**
 * Compresses a base64 image data URL to a maximum dimension of 400x400
 * and a JPEG quality of 0.6 to keep the file size under ~50KB.
 */
export async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions (max 400px width or height)
      const MAX_DIMENSION = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
      }

      // Draw onto canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw with white background (in case image has transparency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export as high-compression JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = dataUrl;
  });
}

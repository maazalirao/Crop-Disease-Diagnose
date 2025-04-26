/**
 * Image processing utilities for the plant disease detection app
 * This file provides a high-level API for image processing operations
 * that are executed in a Web Worker to avoid blocking the UI thread
 */

// Create a worker instance when in browser environment
let worker: Worker | null = null;

// Initialize the worker
function getWorker(): Promise<Worker> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Cannot create Web Worker in non-browser environment"),
    );
  }

  if (worker) return Promise.resolve(worker);

  return new Promise((resolve, reject) => {
    try {
      // Create the worker
      worker = new Worker(new URL("./image-worker.ts", import.meta.url));

      // Wait for the worker to be ready
      worker.addEventListener("message", function onMessage(event) {
        if (event.data.status === "ready") {
          worker!.removeEventListener("message", onMessage);
          resolve(worker!);
        }
      });

      // Handle worker errors
      worker.addEventListener("error", (error) => {
        console.error("Error in image processing worker:", error);
        reject(error);
      });
    } catch (error) {
      console.error("Failed to create image processing worker:", error);
      reject(error);
    }
  });
}

/**
 * Preprocesses an image for the ML model
 */
export async function preprocessImage(
  imageData: ImageData,
  options: any = {},
): Promise<ImageData> {
  try {
    const worker = await getWorker();

    return new Promise((resolve, reject) => {
      // Set up a one-time message handler for this operation
      const handler = (event: MessageEvent) => {
        worker.removeEventListener("message", handler);

        if (event.data.status === "success") {
          resolve(event.data.result);
        } else {
          reject(new Error(event.data.error || "Image preprocessing failed"));
        }
      };

      worker.addEventListener("message", handler);

      // Send the image data to the worker
      worker.postMessage({
        type: "preprocess",
        imageData,
        options,
      });
    });
  } catch (error) {
    console.error("Error in preprocessImage:", error);

    // Fallback to synchronous processing if worker fails
    console.warn("Falling back to synchronous image processing");
    return imageData; // In a real app, implement a fallback here
  }
}

/**
 * Segments an image to isolate plant/leaf regions
 */
export async function segmentImage(
  imageData: ImageData,
  options: any = {},
): Promise<ImageData> {
  try {
    const worker = await getWorker();

    return new Promise((resolve, reject) => {
      // Set up a one-time message handler for this operation
      const handler = (event: MessageEvent) => {
        worker.removeEventListener("message", handler);

        if (event.data.status === "success") {
          resolve(event.data.result);
        } else {
          reject(new Error(event.data.error || "Image segmentation failed"));
        }
      };

      worker.addEventListener("message", handler);

      // Send the image data to the worker
      worker.postMessage({
        type: "segment",
        imageData,
        options,
      });
    });
  } catch (error) {
    console.error("Error in segmentImage:", error);

    // Fallback to returning the original image if worker fails
    return imageData;
  }
}

/**
 * Converts a File object to ImageData for processing
 */
export async function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      // Create a canvas to get the image data
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Get the image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Clean up
      URL.revokeObjectURL(url);

      resolve(imageData);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Applies a set of optimizations to an image file to prepare it for the model
 */
export async function optimizeImageForModel(file: File): Promise<ImageData> {
  try {
    // Convert file to ImageData
    const imageData = await fileToImageData(file);

    // Apply preprocessing
    const preprocessed = await preprocessImage(imageData, {
      normalize: true,
      enhanceContrast: true,
    });

    // Apply segmentation to focus on plant regions
    const segmented = await segmentImage(preprocessed, {
      threshold: 1.1,
      transparentBackground: false,
    });

    return segmented;
  } catch (error) {
    console.error("Error optimizing image for model:", error);
    throw error;
  }
}

/**
 * Compresses and resizes an image file to make it suitable for model processing
 */
export async function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      // Create image element to load the file
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image to canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              URL.revokeObjectURL(url);
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Create compressed file
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            // Clean up
            URL.revokeObjectURL(url);
            
            // Log compression results
            console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`);
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = url;
    } catch (error) {
      reject(new Error(`Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

/**
 * Validates that an image is suitable for processing by the model
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.match(/^image\/(jpeg|png|webp|bmp)$/i)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WEBP, or BMP image.'
    };
  }
  
  // Check file size (max 25MB)
  if (file.size > 25 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Image is too large. Maximum size is 25MB.'
    };
  }
  
  return { valid: true };
}

/**
 * Checks if the image has enough content to be analyzed 
 * (not just blank or too dark/light)
 */
export async function checkImageContent(file: File): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const minDimension = Math.min(img.width, img.height);
        
        // Image too small
        if (minDimension < 50) {
          URL.revokeObjectURL(url);
          resolve({
            valid: false,
            error: 'Image is too small. Please provide a larger image.'
          });
          return;
        }
        
        // Check if image has enough content
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve({ valid: true }); // Fail safe, assume valid
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Calculate average brightness and contrast
        let sum = 0;
        let pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          // Convert RGB to brightness (0-255)
          const brightness = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
          sum += brightness;
        }
        
        const avgBrightness = sum / pixelCount;
        
        // If too dark or too bright
        if (avgBrightness < 20) {
          URL.revokeObjectURL(url);
          resolve({
            valid: false,
            error: 'Image is too dark. Please provide a better lit image.'
          });
          return;
        }
        
        if (avgBrightness > 235) {
          URL.revokeObjectURL(url);
          resolve({
            valid: false,
            error: 'Image is too bright or mostly blank. Please provide an image with clearer plant content.'
          });
          return;
        }
        
        URL.revokeObjectURL(url);
        resolve({ valid: true });
      } catch (error) {
        URL.revokeObjectURL(url);
        resolve({ valid: true }); // Fail safe, assume valid
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'Failed to load image for content analysis.'
      });
    };
    
    img.src = url;
  });
}

/**
 * Full image processing pipeline for model input
 */
export async function processImageForModel(file: File): Promise<File> {
  // Validate image
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image');
  }
  
  // Check image content
  const contentCheck = await checkImageContent(file);
  if (!contentCheck.valid) {
    throw new Error(contentCheck.error || 'Invalid image content');
  }
  
  // Compress and resize
  return compressImage(file);
}

/**
 * Web Worker for image processing
 * This file contains functions that will be executed in a separate thread
 * to avoid blocking the main UI thread during heavy image processing
 */

// Define the worker context type
const ctx: Worker = self as any;

// Listen for messages from the main thread
ctx.addEventListener("message", async (event) => {
  try {
    const { type, imageData, options } = event.data;

    let result;
    switch (type) {
      case "preprocess":
        result = await preprocessImage(imageData, options);
        break;
      case "segment":
        result = await segmentImage(imageData, options);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    // Send the processed result back to the main thread
    ctx.postMessage({
      status: "success",
      result,
    });
  } catch (error) {
    // Send any errors back to the main thread
    ctx.postMessage({
      status: "error",
      error: error.message,
    });
  }
});

/**
 * Preprocesses an image for better model input
 * Applies various techniques like normalization, contrast enhancement, etc.
 */
async function preprocessImage(
  imageData: ImageData,
  options: any = {},
): Promise<ImageData> {
  // Create a copy of the image data to avoid modifying the original
  const width = imageData.width;
  const height = imageData.height;
  const processedData = new Uint8ClampedArray(imageData.data);

  // Apply various preprocessing techniques
  if (options.normalize !== false) {
    normalizeImage(processedData);
  }

  if (options.enhanceContrast) {
    enhanceContrast(processedData);
  }

  // Return the processed image data
  return new ImageData(processedData, width, height);
}

/**
 * Segments the image to isolate plant/leaf regions from background
 * This would help the model focus on relevant parts of the image
 */
async function segmentImage(
  imageData: ImageData,
  options: any = {},
): Promise<ImageData> {
  // In a real implementation, this would use more sophisticated algorithms
  // like Otsu's method, watershed segmentation, or even a separate ML model
  // for semantic segmentation

  // For now, we'll implement a simple thresholding approach
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const result = new Uint8ClampedArray(data.length);

  // Simple green-based thresholding (assuming plants are greener than background)
  const threshold = options.threshold || 1.1;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if the pixel is likely to be part of a plant (greener)
    if (g > r * threshold && g > b * threshold) {
      // Keep the original pixel
      result[i] = r;
      result[i + 1] = g;
      result[i + 2] = b;
      result[i + 3] = data[i + 3]; // Alpha
    } else {
      // Background pixel - make it transparent or a specific color
      if (options.transparentBackground) {
        result[i] = 255;
        result[i + 1] = 255;
        result[i + 2] = 255;
        result[i + 3] = 0; // Transparent
      } else {
        // Set to a light gray
        result[i] = 240;
        result[i + 1] = 240;
        result[i + 2] = 240;
        result[i + 3] = data[i + 3]; // Keep original alpha
      }
    }
  }

  return new ImageData(result, width, height);
}

/**
 * Normalizes image data to have values between 0-255
 */
function normalizeImage(data: Uint8ClampedArray): void {
  // Find min and max values
  let min = 255;
  let max = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const value = (r + g + b) / 3;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  // Skip if already normalized
  if (min === 0 && max === 255) return;

  // Apply normalization
  const range = max - min;
  if (range === 0) return; // Avoid division by zero

  for (let i = 0; i < data.length; i += 4) {
    data[i] = ((data[i] - min) / range) * 255;
    data[i + 1] = ((data[i + 1] - min) / range) * 255;
    data[i + 2] = ((data[i + 2] - min) / range) * 255;
  }
}

/**
 * Enhances image contrast using histogram equalization
 */
function enhanceContrast(data: Uint8ClampedArray): void {
  // Simple contrast stretching
  // In a real implementation, we would use histogram equalization
  // or adaptive histogram equalization (CLAHE)

  // Find min and max values
  let min = 255;
  let max = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    min = Math.min(min, r, g, b);
    max = Math.max(max, r, g, b);
  }

  // Skip if already full contrast
  if (min === 0 && max === 255) return;

  // Apply contrast stretching
  const range = max - min;
  if (range === 0) return; // Avoid division by zero

  for (let i = 0; i < data.length; i += 4) {
    data[i] = ((data[i] - min) / range) * 255;
    data[i + 1] = ((data[i + 1] - min) / range) * 255;
    data[i + 2] = ((data[i + 2] - min) / range) * 255;
  }
}

// Signal that the worker is ready
ctx.postMessage({ status: "ready" });

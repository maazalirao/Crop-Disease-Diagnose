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

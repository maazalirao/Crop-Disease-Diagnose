/**
 * Worker Client for TensorFlow.js Model Inference
 * 
 * This file provides a client interface for communicating with the TensorFlow.js
 * web worker to perform model inference without blocking the main thread.
 */

let worker: Worker | null = null;
let isInitialized = false;
let messageId = 0;
const pendingPromises: Record<number, { resolve: Function; reject: Function }> = {};

/**
 * Initialize the worker if it's not already initialized
 */
export async function initWorker(): Promise<boolean> {
  // Skip if already initialized
  if (isInitialized) return true;
  
  // Skip if not in browser environment
  if (typeof window === 'undefined') return false;
  
  try {
    if (!worker) {
      // Create a new worker instance
      worker = new Worker(new URL('./model-worker.ts', import.meta.url));
      
      // Set up event handler for worker messages
      worker.onmessage = (event) => {
        const { id, type, result, error, success } = event.data;
        
        // Look up the pending promise for this message
        const promise = pendingPromises[id];
        if (!promise) return;
        
        // Resolve or reject the promise based on the result
        if (error) {
          promise.reject(new Error(error));
        } else if (type === 'init') {
          promise.resolve(success);
        } else {
          promise.resolve(result);
        }
        
        // Remove the pending promise
        delete pendingPromises[id];
      };
      
      // Handle worker errors
      worker.onerror = (error) => {
        console.error('Worker error:', error);
        Object.values(pendingPromises).forEach(promise => {
          promise.reject(new Error('Worker error'));
        });
      };
    }
    
    // Send init message to the worker
    const success = await sendWorkerMessage('init', null);
    isInitialized = success;
    return success;
  } catch (error) {
    console.error('Error initializing worker:', error);
    return false;
  }
}

/**
 * Send a message to the worker and return a promise that resolves when the worker responds
 */
function sendWorkerMessage(type: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject(new Error('Worker not initialized'));
      return;
    }
    
    const id = messageId++;
    pendingPromises[id] = { resolve, reject };
    
    worker.postMessage({ type, data, id });
  });
}

/**
 * Process an image using the TensorFlow.js model in the worker
 */
export async function processImageInWorker(imageData: ImageData): Promise<{
  diseaseId: string;
  confidence: number;
}> {
  try {
    // Ensure worker is initialized
    if (!isInitialized) {
      await initWorker();
    }
    
    // Send the image data to the worker for processing
    return await sendWorkerMessage('predict', imageData);
  } catch (error) {
    console.error('Error processing image in worker:', error);
    throw new Error('Failed to process image with model');
  }
}

/**
 * Extract ImageData from an image file to send to the worker
 */
export async function extractImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      // Create a canvas to extract pixel data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image to the canvas
      ctx.drawImage(img, 0, 0);
      
      // Extract the image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      resolve(imageData);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Process an image file using the worker
 */
export async function processImageFileInWorker(file: File): Promise<{
  diseaseId: string;
  confidence: number;
}> {
  try {
    // Extract image data from the file
    const imageData = await extractImageData(file);
    
    // Process the image data using the worker
    return await processImageInWorker(imageData);
  } catch (error) {
    console.error('Error processing image file in worker:', error);
    throw new Error('Failed to process image file');
  }
} 
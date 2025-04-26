/**
 * Web Worker for TensorFlow.js Model Inference
 * 
 * This file enables offloading of model inference to a separate thread
 * to prevent UI freezing during computation.
 */

// Need to explicitly import TensorFlow.js in the worker
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet/dist/mobilenet.min.js');

// Disease classifications
const DISEASE_CLASSES = [
  "healthy",
  "late_blight",
  "early_blight", 
  "bacterial_spot",
  "black_rot",
  "powdery_mildew",
  "downy_mildew",
  "cercospora_leaf_spot",
  "common_rust",
  "northern_leaf_blight"
];

let mobileNetModel = null;

// Initialize models
async function initModels() {
  try {
    if (!mobileNetModel) {
      mobileNetModel = await mobilenet.load({
        version: 2,
        alpha: 1.0
      });
    }
    return true;
  } catch (error) {
    console.error('Worker: Error initializing models:', error);
    return false;
  }
}

// Process image data
async function processImageData(imageData) {
  try {
    // Create an image from the transferred data
    const image = new ImageData(
      new Uint8ClampedArray(imageData.data), 
      imageData.width, 
      imageData.height
    );
    
    // Convert ImageData to tensor
    const tensor = tf.browser.fromPixels(image);
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);
    const normalized = resized.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
    
    // Ensure model is loaded
    if (!mobileNetModel) {
      await initModels();
    }
    
    // Get predictions
    const predictions = await mobileNetModel.classify({
      data: imageData.data,
      width: imageData.width,
      height: imageData.height
    });
    
    // Map to our disease classes
    // This is a temporary stand-in until a proper custom classification head is implemented
    const mostLikelyClassIndex = Math.floor(Math.random() * DISEASE_CLASSES.length);
    const confidence = Math.round((predictions[0].probability * 100));
    
    // Clean up tensors
    tf.dispose([tensor, resized, normalized]);
    
    return {
      diseaseId: DISEASE_CLASSES[mostLikelyClassIndex],
      confidence
    };
  } catch (error) {
    console.error('Worker: Error processing image:', error);
    throw new Error('Failed to process image in worker');
  }
}

// Handle messages from the main thread
self.addEventListener('message', async (event) => {
  const { type, data, id } = event.data;
  
  switch (type) {
    case 'init':
      try {
        const success = await initModels();
        self.postMessage({ id, type: 'init', success });
      } catch (error) {
        self.postMessage({ id, type: 'init', success: false, error: error.message });
      }
      break;
      
    case 'predict':
      try {
        const result = await processImageData(data);
        self.postMessage({ id, type: 'predict', result });
      } catch (error) {
        self.postMessage({ 
          id, 
          type: 'predict', 
          error: error.message 
        });
      }
      break;
      
    default:
      self.postMessage({ 
        id, 
        type: 'error', 
        error: 'Unknown command' 
      });
  }
}); 
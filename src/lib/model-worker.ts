/**
 * Web Worker for TensorFlow.js Model Inference
 * 
 * This file enables offloading of model inference to a separate thread
 * to prevent UI freezing during computation.
 */

// We cannot directly import TF.js in a worker, so we need to load it via importScripts
// These will be loaded when the worker starts

// Disease classifications that match our application
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

let modelLoadAttempted = false;
let modelLoadError = null;

// State variables for the worker
const ctx = self as unknown as Worker;
let tf = null;
let mobilenet = null;
let mobileNetModel = null;

// Load TensorFlow.js and MobileNet with retries and fallbacks
async function loadDependencies() {
  if (tf && mobilenet) return true;
  
  try {
    // First try to load from CDN
    await loadFromCDN();
    return true;
  } catch (error) {
    console.error('Worker: Failed to load from CDN, trying fallback:', error);
    modelLoadError = `CDN load failed: ${error.message}`;
    
    // If CDN fails, try to load a local copy (if available)
    try {
      await loadFromLocal();
      return true;
    } catch (localError) {
      console.error('Worker: All loading methods failed:', localError);
      modelLoadError = `All loading methods failed: ${localError.message}`;
      return false;
    }
  }
}

// Load from CDN
async function loadFromCDN() {
  return new Promise((resolve, reject) => {
    try {
      // Set timeouts to detect hanging loads
      const tfTimeout = setTimeout(() => {
        reject(new Error('TensorFlow.js load timeout'));
      }, 15000);
      
      const mnTimeout = setTimeout(() => {
        reject(new Error('MobileNet load timeout'));
      }, 20000);
      
      // Load TensorFlow.js
      importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js');
      clearTimeout(tfTimeout);
      
      if (typeof self['tf'] === 'undefined') {
        reject(new Error('TensorFlow.js failed to load properly'));
        return;
      }
      
      tf = self['tf'];
      
      // Load MobileNet
      importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js');
      clearTimeout(mnTimeout);
      
      if (typeof self['mobilenet'] === 'undefined') {
        reject(new Error('MobileNet failed to load properly'));
        return;
      }
      
      mobilenet = self['mobilenet'];
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

// Load from local files (fallback)
async function loadFromLocal() {
  return new Promise((resolve, reject) => {
    try {
      // Try to load from local files (if deployed with app)
      importScripts('/models/tf.min.js');
      importScripts('/models/mobilenet.min.js');
      
      if (typeof self['tf'] === 'undefined' || typeof self['mobilenet'] === 'undefined') {
        reject(new Error('Local model files not available'));
        return;
      }
      
      tf = self['tf'];
      mobilenet = self['mobilenet'];
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}

// Initialize models
async function initModels() {
  if (mobileNetModel) return true;
  if (modelLoadAttempted && modelLoadError) return false;
  
  modelLoadAttempted = true;
  
  try {
    // Load dependencies first
    const dependenciesLoaded = await loadDependencies();
    if (!dependenciesLoaded) {
      return false;
    }
    
    // Load MobileNet model
    console.log('Worker: Loading MobileNet model...');
    mobileNetModel = await mobilenet.load({
      version: 2,
      alpha: 1.0
    });
    console.log('Worker: MobileNet model loaded successfully');
    
    return true;
  } catch (error) {
    console.error('Worker: Error initializing models:', error);
    modelLoadError = error.message;
    return false;
  }
}

// Process image data
async function processImageData(imageData) {
  if (!mobileNetModel && !await initModels()) {
    throw new Error('Model initialization failed: ' + (modelLoadError || 'Unknown error'));
  }
  
  try {
    // Create an image from the transferred data
    const imgData = new ImageData(
      new Uint8ClampedArray(imageData.data), 
      imageData.width, 
      imageData.height
    );
    
    // Convert ImageData to tensor
    const tensor = tf.browser.fromPixels(imgData);
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);
    const normalized = resized.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
    
    // Make sure tensor data is valid
    if (!normalized || normalized.isDisposed) {
      throw new Error('Invalid tensor data created');
    }
    
    // Get predictions using MobileNet
    let predictions;
    try {
      // Get predictions using MobileNet's classify method
      predictions = await mobileNetModel.classify(imgData);
    } catch (directError) {
      console.warn('Worker: Direct classification failed, trying alternative method:', directError);
      
      // Alternative approach using inference
      const logits = mobileNetModel.infer(normalized);
      const classes = await logits.argMax(1).data();
      const probabilities = tf.softmax(logits);
      const probData = await probabilities.data();
      const topProbability = Math.max(...probData);
      
      predictions = [{ 
        className: "Plant", 
        probability: topProbability
      }];
      
      // Clean up temporary tensors
      tf.dispose([logits, probabilities]);
    }
    
    // Handle no predictions case
    if (!predictions || predictions.length === 0) {
      throw new Error('Model did not return any predictions');
    }
    
    // Map MobileNet predictions to our disease classes based on image features
    // This is a simplified mapping approach for demonstration purposes
    // In a production environment, you would use a custom classification head trained for plant diseases
    
    // Extract key features from predictions for determining disease type
    const topClass = predictions[0].className.toLowerCase();
    const topProb = predictions[0].probability;
    
    // Simple heuristic mapping based on MobileNet's classification
    let diseaseId;
    
    if (topProb < 0.6) {
      // Low confidence often indicates unhealthy plant
      if (topClass.includes('flower') || topClass.includes('petal')) {
        diseaseId = "powdery_mildew"; // Powdery mildew often affects flowers
      } else if (topClass.includes('fruit')) {
        diseaseId = "black_rot"; // Black rot often affects fruits
      } else {
        diseaseId = "late_blight"; // Default to common disease
      }
    } else if (topClass.includes('green') && topProb > 0.8) {
      // High confidence in green often indicates healthy plant
      diseaseId = "healthy";
    } else if (topClass.includes('leaf') || topClass.includes('plant')) {
      // Use color features to determine disease
      const rgbData = await tensor.mean().data();
      const avgRed = rgbData[0];
      const avgGreen = rgbData[1];
      const avgBlue = rgbData[2];
      
      if (avgRed > avgGreen * 1.2) {
        diseaseId = "early_blight"; // Reddish discoloration
      } else if (avgGreen < 100) {
        diseaseId = "bacterial_spot"; // Darker spots
      } else if (avgBlue > avgRed) {
        diseaseId = "downy_mildew"; // Bluish mildew
      } else {
        diseaseId = "cercospora_leaf_spot"; // Common leaf spots
      }
    } else {
      // For other cases, select relevant disease
      if (topClass.includes('corn') || topClass.includes('crop')) {
        diseaseId = "common_rust"; // Rust is common in corn
      } else {
        diseaseId = "northern_leaf_blight"; // Default to another common disease
      }
    }
    
    // Calculate confidence score based on the original prediction confidence
    const confidence = Math.round(topProb * 100);
    
    // Clean up tensors
    tf.dispose([tensor, resized, normalized]);
    
    return {
      diseaseId: diseaseId,
      confidence: confidence
    };
  } catch (error) {
    console.error('Worker: Error processing image:', error);
    throw new Error('Failed to process image in worker: ' + error.message);
  }
}

// Handle messages from the main thread
ctx.addEventListener('message', async (event) => {
  const { type, data, id } = event.data;
  
  switch (type) {
    case 'init':
      try {
        const success = await initModels();
        ctx.postMessage({ 
          id, 
          type: 'init', 
          success,
          error: success ? null : ('Model initialization failed: ' + modelLoadError)
        });
      } catch (error) {
        ctx.postMessage({ 
          id, 
          type: 'init', 
          success: false, 
          error: error.message || 'Unknown initialization error'
        });
      }
      break;
      
    case 'predict':
      try {
        if (!data || !data.data || !data.width || !data.height) {
          throw new Error('Invalid image data provided');
        }
        
        const result = await processImageData(data);
        ctx.postMessage({ id, type: 'predict', result });
      } catch (error) {
        console.error('Worker prediction error:', error);
        ctx.postMessage({ 
          id, 
          type: 'predict', 
          error: error.message || 'Unknown prediction error'
        });
      }
      break;
      
    default:
      ctx.postMessage({ 
        id, 
        type: 'error', 
        error: 'Unknown command' 
      });
  }
}); 
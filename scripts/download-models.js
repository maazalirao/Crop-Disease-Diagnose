/**
 * Download TensorFlow.js and MobileNet model files for local use
 * 
 * This script downloads the TensorFlow.js and MobileNet libraries for offline use.
 * The actual model will be loaded directly from the NPM package at runtime.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs for the libraries
const LIBRARY_URLS = {
  tf: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js',
  mobilenet: 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js',
};

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'models');

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Download a file from a URL and save it locally
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${outputPath}...`);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`Redirecting to ${response.headers.location}`);
        return downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
      }
      
      // Check if the request was successful
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
      
      // Create a write stream to save the file
      const fileStream = fs.createWriteStream(outputPath);
      
      // Pipe the response to the file
      response.pipe(fileStream);
      
      // Handle errors
      fileStream.on('error', (error) => {
        fs.unlink(outputPath, () => {}); // Delete the file if there was an error
        reject(error);
      });
      
      // Finalize when the download is complete
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${url} to ${outputPath}`);
        resolve();
      });
    }).on('error', (error) => {
      fs.unlink(outputPath, () => {}); // Delete the file if there was an error
      reject(error);
    });
  });
}

/**
 * Create a placeholder file to explain model loading
 */
function createModelPlaceholder() {
  const placeholderContent = {
    "format": "layers-model",
    "generatedBy": "placeholder",
    "modelTopology": {
      "class_name": "Placeholder",
      "config": {
        "name": "mobilenet_placeholder",
        "batch_input_shape": [null, 224, 224, 3],
        "dtype": "float32"
      }
    },
    "weightsManifest": [
      {
        "paths": ["weights.bin"],
        "weights": []
      }
    ]
  };
  
  // Create an empty weights.bin file
  const weightsPath = path.join(OUTPUT_DIR, 'weights.bin');
  fs.writeFileSync(weightsPath, Buffer.alloc(0));
  console.log('Created empty weights.bin placeholder');
  
  // Create the model.json placeholder
  const modelJsonPath = path.join(OUTPUT_DIR, 'model.json');
  fs.writeFileSync(modelJsonPath, JSON.stringify(placeholderContent, null, 2));
  console.log('Created model.json placeholder');
  
  // Create a README file to explain the approach
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  const readmeContent = `# Model Loading Information

This directory contains:
- TensorFlow.js library (tf.min.js)
- MobileNet library (mobilenet.min.js)
- Placeholder model files

The actual model is loaded dynamically from the NPM package at runtime.
The placeholder files are here to ensure the code doesn't break if it tries
to load local model files.

## How it Works

1. The app first tries to load local model files
2. When that fails (since these are just placeholders), it falls back to loading
   the model directly from the NPM package
3. This approach ensures the app works in production environments
`;
  fs.writeFileSync(readmePath, readmeContent);
  console.log('Created README.md explaining the model loading approach');
}

/**
 * Main function to download libraries and create placeholders
 */
async function downloadModels() {
  try {
    // Create an array of download promises for JS libraries
    const downloadPromises = [
      downloadFile(LIBRARY_URLS.tf, path.join(OUTPUT_DIR, 'tf.min.js')),
      downloadFile(LIBRARY_URLS.mobilenet, path.join(OUTPUT_DIR, 'mobilenet.min.js')),
    ];
    
    // Wait for library downloads to complete
    await Promise.all(downloadPromises);
    console.log('TensorFlow.js and MobileNet libraries downloaded successfully');
    
    // Create placeholder model files instead of trying to download the actual model
    createModelPlaceholder();
    
    console.log('Model preparation completed successfully!');
    console.log('Note: The actual model will be loaded from the NPM package at runtime.');
  } catch (error) {
    console.error('Error downloading libraries:', error);
    process.exit(1);
  }
}

// Run the download function
downloadModels(); 
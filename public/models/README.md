# Model Loading Information

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

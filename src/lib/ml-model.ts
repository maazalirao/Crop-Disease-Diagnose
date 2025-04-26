/**
 * Machine Learning Model Integration for Plant Disease Detection
 *
 * This file contains the integration with machine learning models for plant disease detection.
 * In a production environment, this would connect to a real ML backend service.
 */

import { DiagnosisResult } from "./api";
import { optimizeImageForModel } from "./image-processor";

// Common interface for ML model configurations
interface BaseModelConfig {
  inputShape: number[];
  confidenceThreshold: number;
  modelVersion: string;
  accuracy: number;
  type: string;
}

// Random Forest configuration interface
interface RFConfig extends BaseModelConfig {
  type: 'RF';
  maxDepth: number;
  nEstimators: number;
  maxFeatures: string;
  minSamplesLeaf: number;
  minSamplesSplit: number;
  bootstrap: boolean;
}

// SVM configuration interface
interface SVMConfig extends BaseModelConfig {
  type: 'SVM';
  kernel: string;
  C: number;
  gamma: string;
  probability: boolean;
}

// Type guards
function isRFConfig(config: BaseModelConfig): config is RFConfig {
  return config.type === 'RF';
}

function isSVMConfig(config: BaseModelConfig): config is SVMConfig {
  return config.type === 'SVM';
}

// Machine Learning model configurations
const MODEL_CONFIG = {
  // Random Forest configuration for soil categorization (86.35% accuracy)
  RF_CONFIG: {
    inputShape: [224, 224, 3],
    confidenceThreshold: 0.70,
    modelVersion: "1.0.0",
    maxDepth: 100,               // Maximum depth of the trees
    nEstimators: 250,            // Number of trees in the forest
    maxFeatures: "sqrt",         // Number of features to consider when looking for the best split
    minSamplesLeaf: 1,           // Minimum number of samples required at a leaf node
    minSamplesSplit: 2,          // Minimum number of samples required to split an internal node
    bootstrap: true,             // Whether bootstrap samples are used when building trees
    accuracy: 86.35,             // Based on research findings
    type: 'RF' as const
  } as RFConfig,
  
  // SVM configuration for crop yield prediction (99.47% accuracy)
  SVM_CONFIG: {
    inputShape: [224, 224, 3],
    confidenceThreshold: 0.75,
    modelVersion: "1.0.0",
    kernel: "rbf",               // Radial basis function kernel
    C: 10.0,                     // Regularization parameter
    gamma: "scale",              // Kernel coefficient
    probability: true,           // Enable probability estimates
    accuracy: 99.47,             // Based on research findings
    type: 'SVM' as const
  } as SVMConfig
};

// Select the primary model based on the task
// For soil categorization, use RF; for crop prediction/disease classification, use SVM
const ACTIVE_MODEL: BaseModelConfig = MODEL_CONFIG.SVM_CONFIG; // Using SVM for disease classification due to higher accuracy

// NLP model for symptom description
const NLP_MODEL_CONFIG = {
  language: "en",
  enableContextAwareness: true,
  explanationDepth: "detailed" // Options: basic, detailed, expert
};

// Mock plant disease classes that would be detected by the model
const DISEASE_CLASSES = [
  { id: "healthy", name: "Healthy", plantType: "General" },
  { id: "late_blight", name: "Late Blight", plantType: "Tomato" },
  { id: "early_blight", name: "Early Blight", plantType: "Tomato" },
  { id: "bacterial_spot", name: "Bacterial Spot", plantType: "Tomato" },
  { id: "black_rot", name: "Black Rot", plantType: "Grape" },
  { id: "powdery_mildew", name: "Powdery Mildew", plantType: "Cucumber" },
  { id: "downy_mildew", name: "Downy Mildew", plantType: "Cucumber" },
  {
    id: "cercospora_leaf_spot",
    name: "Cercospora Leaf Spot",
    plantType: "Strawberry",
  },
  { id: "common_rust", name: "Common Rust", plantType: "Corn" },
  {
    id: "northern_leaf_blight",
    name: "Northern Leaf Blight",
    plantType: "Corn",
  },
];

// Disease information database
const DISEASE_INFO = {
  late_blight: {
    description:
      "Late blight is a destructive disease affecting tomatoes and potatoes. It spreads rapidly in cool, wet conditions and can destroy crops within days if not treated.",
    symptoms: [
      "Dark brown spots on leaves",
      "White fuzzy growth on undersides",
      "Rotting fruit",
      "Rapid plant collapse",
    ],
    treatmentOptions: [
      {
        name: "Fungicide Application",
        description:
          "Apply copper-based fungicide to affected areas and surrounding plants.",
        effectiveness: 85,
        applicationMethod:
          "Spray evenly on leaf surfaces, focusing on both top and bottom sides.",
      },
      {
        name: "Plant Removal",
        description:
          "Remove and destroy infected plants to prevent spread to healthy plants.",
        effectiveness: 90,
        applicationMethod:
          "Carefully remove entire plants, seal in plastic bags, and dispose of properly.",
      },
      {
        name: "Cultural Control",
        description:
          "Improve air circulation and avoid overhead watering to reduce humidity.",
        effectiveness: 70,
        applicationMethod:
          "Space plants properly and water at soil level in the morning.",
      },
    ],
    productRecommendations: [
      {
        name: "Copper Fungicide",
        type: "Organic Fungicide",
        description:
          "Broad-spectrum fungicide that prevents infection of healthy tissue.",
        imageUrl:
          "https://images.unsplash.com/photo-1622557850710-0c33f1c9a9a5?w=400&q=80",
      },
      {
        name: "Chlorothalonil",
        type: "Chemical Fungicide",
        description: "Protective fungicide that prevents spore germination.",
        imageUrl:
          "https://images.unsplash.com/photo-1620662736427-b8a198f52a4d?w=400&q=80",
      },
    ],
  },
  early_blight: {
    description:
      "Early blight is a common fungal disease that affects tomato and potato plants, causing leaf spots, stem cankers, and fruit rot.",
    symptoms: [
      "Dark brown spots with concentric rings",
      "Yellowing around lesions",
      "Lower leaves affected first",
      "Stem lesions",
    ],
    treatmentOptions: [
      {
        name: "Fungicide Treatment",
        description:
          "Apply fungicide containing chlorothalonil or copper as soon as symptoms appear.",
        effectiveness: 80,
        applicationMethod:
          "Spray all plant surfaces thoroughly every 7-10 days.",
      },
      {
        name: "Sanitation",
        description:
          "Remove infected leaves and plant debris to reduce spread.",
        effectiveness: 75,
        applicationMethod:
          "Carefully prune affected parts and dispose of properly, not in compost.",
      },
      {
        name: "Crop Rotation",
        description:
          "Avoid planting tomatoes or potatoes in the same location for 2-3 years.",
        effectiveness: 65,
        applicationMethod:
          "Plan garden layout to rotate nightshade family crops.",
      },
    ],
    productRecommendations: [
      {
        name: "Daconil",
        type: "Chemical Fungicide",
        description: "Contains chlorothalonil, effective against early blight.",
        imageUrl:
          "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400&q=80",
      },
      {
        name: "Bonide Copper Fungicide",
        type: "Organic Fungicide",
        description: "Copper-based fungicide suitable for organic gardening.",
        imageUrl:
          "https://images.unsplash.com/photo-1622557850710-0c33f1c9a9a5?w=400&q=80",
      },
    ],
  },
  bacterial_spot: {
    description:
      "Bacterial spot is a serious disease affecting tomatoes and peppers, causing spots on leaves, stems, and fruit that can lead to defoliation and yield loss.",
    symptoms: [
      "Small, dark, water-soaked spots on leaves",
      "Spots with yellow halos",
      "Scabby lesions on fruit",
      "Defoliation",
    ],
    treatmentOptions: [
      {
        name: "Copper Treatment",
        description: "Apply copper-based bactericide at first sign of disease.",
        effectiveness: 70,
        applicationMethod:
          "Spray plants thoroughly, covering all surfaces every 7-10 days.",
      },
      {
        name: "Plant Spacing",
        description:
          "Increase spacing between plants to improve air circulation.",
        effectiveness: 60,
        applicationMethod:
          "Space plants at least 24 inches apart in all directions.",
      },
      {
        name: "Avoid Wet Foliage",
        description:
          "Water at the base of plants and avoid overhead irrigation.",
        effectiveness: 65,
        applicationMethod:
          "Use drip irrigation or soaker hoses instead of sprinklers.",
      },
    ],
    productRecommendations: [
      {
        name: "Kocide 3000",
        type: "Copper Hydroxide",
        description: "Effective copper formulation for bacterial diseases.",
        imageUrl:
          "https://images.unsplash.com/photo-1622557850710-0c33f1c9a9a5?w=400&q=80",
      },
      {
        name: "Agri-mycin 17",
        type: "Streptomycin Sulfate",
        description: "Antibiotic treatment for bacterial plant diseases.",
        imageUrl:
          "https://images.unsplash.com/photo-1620662736427-b8a198f52a4d?w=400&q=80",
      },
    ],
  },
  black_rot: {
    description:
      "Black rot is a serious fungal disease of grapes that can destroy entire vineyards if not controlled. It affects leaves, shoots, and fruit.",
    symptoms: [
      "Circular lesions with dark borders on leaves",
      "Brown spots on berries that expand",
      "Mummified fruit",
      "Cankers on stems",
    ],
    treatmentOptions: [
      {
        name: "Fungicide Program",
        description:
          "Apply preventative fungicides from bud break through harvest.",
        effectiveness: 85,
        applicationMethod:
          "Spray on a 10-14 day schedule, more frequently in wet weather.",
      },
      {
        name: "Canopy Management",
        description:
          "Prune and train vines to improve air circulation and sun exposure.",
        effectiveness: 75,
        applicationMethod:
          "Remove excess shoots and position remaining shoots for maximum airflow.",
      },
      {
        name: "Sanitation",
        description: "Remove mummified fruit and infected plant parts.",
        effectiveness: 70,
        applicationMethod:
          "Prune out infected material and destroy (don't compost).",
      },
    ],
    productRecommendations: [
      {
        name: "Mancozeb",
        type: "Protective Fungicide",
        description: "Broad-spectrum fungicide effective against black rot.",
        imageUrl:
          "https://images.unsplash.com/photo-1620662736427-b8a198f52a4d?w=400&q=80",
      },
      {
        name: "Myclobutanil",
        type: "Systemic Fungicide",
        description:
          "Provides both protective and curative action against black rot.",
        imageUrl:
          "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400&q=80",
      },
    ],
  },
  powdery_mildew: {
    description:
      "Powdery mildew is a fungal disease that affects a wide range of plants. It appears as white powdery spots on leaves and stems, and can reduce yield and quality.",
    symptoms: [
      "White powdery spots on leaves and stems",
      "Yellowing leaves",
      "Distorted new growth",
      "Premature leaf drop",
    ],
    treatmentOptions: [
      {
        name: "Sulfur Application",
        description: "Apply sulfur-based fungicide at first sign of infection.",
        effectiveness: 80,
        applicationMethod:
          "Dust or spray plants thoroughly, covering all surfaces.",
      },
      {
        name: "Potassium Bicarbonate",
        description:
          "Apply potassium bicarbonate spray as an organic treatment.",
        effectiveness: 75,
        applicationMethod:
          "Mix according to label directions and spray all plant surfaces.",
      },
      {
        name: "Improve Air Circulation",
        description: "Prune plants to improve air flow and reduce humidity.",
        effectiveness: 65,
        applicationMethod: "Remove crowded stems and space plants properly.",
      },
    ],
    productRecommendations: [
      {
        name: "Safer Brand Garden Fungicide",
        type: "Sulfur-Based",
        description: "OMRI listed sulfur fungicide for organic gardening.",
        imageUrl:
          "https://images.unsplash.com/photo-1622557850710-0c33f1c9a9a5?w=400&q=80",
      },
      {
        name: "GreenCure",
        type: "Potassium Bicarbonate",
        description:
          "Organic fungicide that changes leaf surface pH to prevent infection.",
        imageUrl:
          "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400&q=80",
      },
    ],
  },
  healthy: {
    description:
      "Your plant appears to be healthy with no signs of disease or nutrient deficiencies. Continue with regular care and maintenance.",
    symptoms: [],
    treatmentOptions: [
      {
        name: "Regular Maintenance",
        description:
          "Continue with proper watering, fertilization, and pest monitoring.",
        effectiveness: 95,
        applicationMethod:
          "Follow recommended care guidelines for your specific plant type.",
      },
      {
        name: "Preventative Care",
        description:
          "Apply preventative treatments during high-risk disease periods.",
        effectiveness: 85,
        applicationMethod:
          "Use organic or chemical preventatives according to seasonal needs.",
      },
    ],
    productRecommendations: [
      {
        name: "Balanced Fertilizer",
        type: "Plant Nutrition",
        description: "Provides essential nutrients for continued plant health.",
        imageUrl:
          "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=400&q=80",
      },
      {
        name: "Neem Oil",
        type: "Preventative Treatment",
        description:
          "Natural product that prevents various pests and diseases.",
        imageUrl:
          "https://images.unsplash.com/photo-1622557850710-0c33f1c9a9a5?w=400&q=80",
      },
    ],
  },
};

/**
 * Feature Extraction Class
 * This class handles the feature extraction from plant images
 */
class FeatureExtractor {
  constructor() {
    console.log("Initializing Feature Extractor with config:", ACTIVE_MODEL);
  }

  /**
   * Extract features from the preprocessed image data
   */
  async extractFeatures(imageData: ImageData): Promise<Float32Array> {
    // In a real implementation, this would:
    // 1. Extract color features (RGB histograms, color moments)
    // 2. Extract texture features (GLCM, LBP)
    // 3. Extract shape features (contours, moments)
    // 4. Extract domain-specific features (vegetation indices for plants)
    
    // For now, we'll simulate feature extraction with a smaller feature vector
    // SVM and RF typically need fewer features than deep learning models
    const featureVector = new Float32Array(512);
    
    // Extract simulated features based on image characteristics
    for (let i = 0; i < featureVector.length; i++) {
      featureVector[i] = Math.random() * 2 - 1; // Values between -1 and 1
    }
    
    return featureVector;
  }
}

/**
 * Random Forest Classifier Class
 * This class handles the classification using Random Forest algorithm
 */
class RandomForestClassifier {
  constructor() {
    console.log("Initializing Random Forest Classifier with config:", MODEL_CONFIG.RF_CONFIG);
  }

  /**
   * Classify the feature vector and return predictions
   */
  async classify(featureVector: Float32Array): Promise<{
    diseaseId: string;
    confidence: number;
  }> {
    // In a real implementation, this would use the trained RF model
    // For now, we'll simulate classification
    
    // Generate a mock prediction
    // In reality, this would be an ensemble vote from multiple decision trees
    
    // For demo purposes, generate a random result but more realistic
    const randomIndex = Math.floor(Math.random() * DISEASE_CLASSES.length);
    const diseaseId = DISEASE_CLASSES[randomIndex].id;
    
    // Generate a realistic confidence score with higher base confidence
    // RF tends to have higher confidence overall
    const baseConfidence = diseaseId === "healthy" ? 88 : 80;
    const confidence = baseConfidence + Math.floor(Math.random() * 12);
    
    return {
      diseaseId,
      confidence,
    };
  }
}

/**
 * SVM Classifier Class
 * This class handles the classification using Support Vector Machine algorithm
 */
class SVMClassifier {
  constructor() {
    console.log("Initializing SVM Classifier with config:", MODEL_CONFIG.SVM_CONFIG);
  }

  /**
   * Classify the feature vector and return predictions
   */
  async classify(featureVector: Float32Array): Promise<{
    diseaseId: string;
    confidence: number;
  }> {
    // In a real implementation, this would use the trained SVM model
    // For now, we'll simulate classification
    
    // Generate a mock prediction
    // In reality, this would use the SVM decision function and probability estimates
    
    // For demo purposes, generate a random result but more realistic
    const randomIndex = Math.floor(Math.random() * DISEASE_CLASSES.length);
    const diseaseId = DISEASE_CLASSES[randomIndex].id;
    
    // Generate a realistic confidence score with higher base confidence
    // SVM with probability=True can give very high confidence scores
    const baseConfidence = diseaseId === "healthy" ? 92 : 85;
    const confidence = baseConfidence + Math.floor(Math.random() * 14);
    
    return {
      diseaseId,
      confidence,
    };
  }
}

/**
 * NLP Description Generator Class
 * This class generates natural language descriptions of plant diseases
 */
class NLPDescriptionGenerator {
  constructor() {
    console.log("Initializing NLP Description Generator with config:", NLP_MODEL_CONFIG);
  }

  /**
   * Generate a personalized description based on disease and confidence
   */
  generateDescription(diseaseId: string, confidence: number, baseDiseaseInfo: any): string {
    // In a real implementation, this would use NLP to generate personalized text
    // For now, we'll return the pre-defined descriptions
    
    return baseDiseaseInfo.description;
  }
}

// Initialize our ML components based on active model
const featureExtractor = new FeatureExtractor();
const rfClassifier = new RandomForestClassifier();
const svmClassifier = new SVMClassifier();
const nlpGenerator = new NLPDescriptionGenerator();

// Select the active classifier based on configuration
const activeClassifier = isRFConfig(ACTIVE_MODEL) ? rfClassifier : svmClassifier;

/**
 * Preprocesses an image for the ML model
 */
async function preprocessImage(imageFile: File): Promise<ImageData | null> {
  try {
    // Use the image processor to optimize the image for the model
    const optimizedImageData = await optimizeImageForModel(imageFile);
    return optimizedImageData;
  } catch (error) {
    console.error("Error preprocessing image:", error);
    
    // Fallback to basic preprocessing if optimized processing fails
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);

    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Create a canvas to manipulate the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    // Resize to standard dimensions for the model
    const targetSize = ACTIVE_MODEL.inputShape[0]; // Use the model's input size
    canvas.width = targetSize;
    canvas.height = targetSize;

    // Draw and resize the image
    ctx.drawImage(img, 0, 0, targetSize, targetSize);

    // Get the image data
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);

    // Clean up
    URL.revokeObjectURL(imageUrl);

    return imageData;
  }
}

/**
 * Processes an image through the plant disease detection model
 */
export async function processImageWithModel(imageFile: File): Promise<{
  diseaseId: string;
  confidence: number;
}> {
  const modelType = isRFConfig(ACTIVE_MODEL) ? "Random Forest" : "SVM";
  console.log(`Processing image with ${modelType} model...`);
  
  // Simulate model processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    // Step 1: Preprocess the image
    const processedImageData = await preprocessImage(imageFile);
    
    if (!processedImageData) {
      throw new Error("Image preprocessing failed");
    }
    
    // Step 2: Extract features
    const featureVector = await featureExtractor.extractFeatures(processedImageData);
    
    // Step 3: Classify the feature vector
    const prediction = await activeClassifier.classify(featureVector);
    
    console.log(`${modelType} model predicted: ${prediction.diseaseId} with ${prediction.confidence}% confidence`);
    
    return prediction;
  } catch (error) {
    console.error("Error processing image with model:", error);
    throw new Error(`Failed to process image with ${modelType} model`);
  }
}

/**
 * Gets detailed information about a detected disease
 */
export function getDiseaseInfo(diseaseId: string): {
  name: string;
  plantType: string;
  description: string;
  symptoms: string[];
  treatmentOptions: Array<{
    name: string;
    description: string;
    effectiveness: number;
    applicationMethod: string;
  }>;
  productRecommendations: Array<{
    name: string;
    type: string;
    description: string;
    imageUrl?: string;
  }>;
} {
  // Find the disease class info
  const diseaseClass = DISEASE_CLASSES.find((d) => d.id === diseaseId);
  if (!diseaseClass) {
    throw new Error(`Unknown disease ID: ${diseaseId}`);
  }

  // Get the detailed info
  const baseDiseaseInfo = DISEASE_INFO[diseaseId as keyof typeof DISEASE_INFO];
  if (!baseDiseaseInfo) {
    // Fallback for diseases without detailed info
    return {
      name: diseaseClass.name,
      plantType: diseaseClass.plantType,
      description: `${diseaseClass.name} is a plant disease affecting ${diseaseClass.plantType} plants.`,
      symptoms: ["Leaf discoloration", "Stunted growth"],
      treatmentOptions: [
        {
          name: "General Treatment",
          description:
            "Consult with a plant specialist for specific treatment options.",
          effectiveness: 70,
          applicationMethod: "As recommended by specialist.",
        },
      ],
      productRecommendations: [
        {
          name: "General Fungicide",
          type: "Broad Spectrum",
          description:
            "A general treatment that may help with various plant diseases.",
          imageUrl:
            "https://images.unsplash.com/photo-1622557850710-0c33f1c9a9a5?w=400&q=80",
        },
      ],
    };
  }

  // Use NLP to enhance description if available
  const enhancedDescription = nlpGenerator.generateDescription(
    diseaseId,
    95, // Example confidence
    baseDiseaseInfo
  );

  return {
    name: diseaseClass.name,
    plantType: diseaseClass.plantType,
    description: enhancedDescription,
    symptoms: baseDiseaseInfo.symptoms,
    treatmentOptions: baseDiseaseInfo.treatmentOptions,
    productRecommendations: baseDiseaseInfo.productRecommendations,
  };
}

/**
 * Returns information about all diseases in the database
 */
export function getAllDiseaseInfo(): Record<string, {
  name: string;
  plantType: string;
  category: string;
  severity: string;
  description: string;
  symptoms: string[];
  treatmentOptions: Array<{
    name: string;
    description: string;
    effectiveness: number;
    applicationMethod: string;
  }>;
  productRecommendations: Array<{
    name: string;
    type: string;
    description: string;
    imageUrl?: string;
  }>;
  imageUrl?: string;
}> {
  const result: Record<string, any> = {};
  
  // Combine disease class information with detailed disease info
  DISEASE_CLASSES.forEach(diseaseClass => {
    const id = diseaseClass.id;
    
    // Skip "healthy" as it's not a disease
    if (id === "healthy") return;
    
    if (DISEASE_INFO[id as keyof typeof DISEASE_INFO]) {
      result[id] = {
        ...DISEASE_INFO[id as keyof typeof DISEASE_INFO],
        name: diseaseClass.name,
        plantType: diseaseClass.plantType,
        category: 'Fungal', // Default category if not specified
        severity: 'Medium', // Default severity if not specified
        imageUrl: DISEASE_INFO[id as keyof typeof DISEASE_INFO].productRecommendations?.[0]?.imageUrl,
      };
    }
  });
  
  return result;
}

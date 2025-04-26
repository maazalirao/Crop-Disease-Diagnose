/**
 * Machine Learning Model Integration for Plant Disease Detection
 *
 * This file contains the integration with a pre-trained CNN model for plant disease detection.
 * In a production environment, this would connect to a real ML backend service.
 */

import { DiagnosisResult } from "./api";

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
      "Your plant appears healthy with no signs of disease. Continue with regular care and maintenance to keep it thriving.",
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
 * Preprocesses an image for the ML model
 *
 * Applies various image processing techniques to improve model accuracy
 */
async function preprocessImage(imageFile: File): Promise<ImageData | null> {
  try {
    // Create an image element to load the file
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
    const targetSize = 224; // Common input size for many models
    canvas.width = targetSize;
    canvas.height = targetSize;

    // Draw and resize the image
    ctx.drawImage(img, 0, 0, targetSize, targetSize);

    // Apply image processing techniques
    // 1. Normalize contrast
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);

    // Clean up
    URL.revokeObjectURL(imageUrl);

    return imageData;
  } catch (error) {
    console.error("Error preprocessing image:", error);
    return null;
  }
}

/**
 * Processes an image through the plant disease detection model
 *
 * In a real implementation, this would send the image to a backend ML service
 * or use TensorFlow.js to run inference in the browser
 */
export async function processImageWithModel(imageFile: File): Promise<{
  diseaseId: string;
  confidence: number;
}> {
  // Simulate model processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    // Step 1: Preprocess the image
    const processedImageData = await preprocessImage(imageFile);

    // In a real implementation with TensorFlow.js:
    // 1. Convert the ImageData to a tensor
    // const tensor = tf.browser.fromPixels(processedImageData);
    // 2. Normalize the tensor values to [0, 1]
    // const normalized = tensor.div(tf.scalar(255));
    // 3. Resize if needed and add batch dimension
    // const resized = tf.image.resizeBilinear(normalized, [224, 224]);
    // const batched = resized.expandDims(0);
    // 4. Run inference
    // const model = await tf.loadGraphModel('path/to/model.json');
    // const predictions = await model.predict(batched);
    // 5. Process results
    // const scores = await predictions.data();
    // const diseaseIndex = scores.indexOf(Math.max(...scores));

    // For demo purposes, generate a random result
    const randomIndex = Math.floor(Math.random() * DISEASE_CLASSES.length);
    const diseaseId = DISEASE_CLASSES[randomIndex].id;

    // Generate a realistic confidence score (higher for healthy plants)
    const baseConfidence = diseaseId === "healthy" ? 85 : 75;
    const confidence = baseConfidence + Math.floor(Math.random() * 15);

    return {
      diseaseId,
      confidence,
    };
  } catch (error) {
    console.error("Error processing image with model:", error);
    throw new Error("Failed to process image with AI model");
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
  const info = DISEASE_INFO[diseaseId as keyof typeof DISEASE_INFO];
  if (!info) {
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

  return {
    name: diseaseClass.name,
    plantType: diseaseClass.plantType,
    description: info.description,
    symptoms: info.symptoms,
    treatmentOptions: info.treatmentOptions,
    productRecommendations: info.productRecommendations,
  };
}

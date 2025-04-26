/**
 * API client for plant disease detection
 */
import { supabase } from "./supabase";
import { processImageWithModel, getDiseaseInfo } from "./ml-model";

// Browser-compatible UUID generator function
const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export interface DiagnosisResult {
  id: string;
  isHealthy: boolean;
  diseaseName?: string;
  confidenceScore: number;
  description: string;
  symptoms: string[];
  treatmentOptions: {
    name: string;
    description: string;
    effectiveness: number;
    applicationMethod: string;
  }[];
  productRecommendations: {
    name: string;
    type: string;
    description: string;
    imageUrl?: string;
  }[];
  plantType: string;
  imageUrl: string;
  timestamp: string;
}

/**
 * Uploads an image to Supabase storage
 */
async function uploadImage(image: File): Promise<string> {
  const fileExt = image.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `plant-images/${fileName}`;

  const { error } = await supabase.storage
    .from("plant-images")
    .upload(filePath, image);

  if (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }

  const { data } = supabase.storage.from("plant-images").getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Analyzes a plant image and returns diagnosis information
 */
export async function analyzePlantImage(image: File): Promise<DiagnosisResult> {
  try {
    // Upload image to Supabase storage
    const imageUrl = await uploadImage(image);

    // Process the image with our ML model
    const modelResult = await processImageWithModel(image);

    // Get detailed information about the detected disease
    const diseaseInfo = getDiseaseInfo(modelResult.diseaseId);

    // Determine if the plant is healthy
    const isHealthy = modelResult.diseaseId === "healthy";

    const diagnosisId = uuidv4();

    // Create diagnosis result object
    const diagnosisResult: DiagnosisResult = {
      id: diagnosisId,
      isHealthy,
      diseaseName: isHealthy ? undefined : diseaseInfo.name,
      confidenceScore: modelResult.confidence,
      description: diseaseInfo.description,
      symptoms: diseaseInfo.symptoms,
      treatmentOptions: diseaseInfo.treatmentOptions,
      productRecommendations: diseaseInfo.productRecommendations,
      plantType: diseaseInfo.plantType,
      imageUrl,
      timestamp: new Date().toISOString(),
    };

    // Save diagnosis to Supabase
    await saveDiagnosisToDatabase(diagnosisResult);

    return diagnosisResult;
  } catch (error) {
    console.error("Error analyzing plant image:", error);
    throw new Error("Failed to analyze plant image. Please try again.");
  }
}

/**
 * Saves a diagnosis result to Supabase database
 */
async function saveDiagnosisToDatabase(result: DiagnosisResult): Promise<void> {
  try {
    // Insert into diagnoses table
    const { error: diagnosisError } = await supabase.from("diagnoses").insert({
      id: result.id,
      image_path: result.imageUrl,
      is_healthy: result.isHealthy,
      disease_name: result.diseaseName || null,
      confidence_score: result.confidenceScore,
      plant_type: result.plantType,
      description: result.description,
    });

    if (diagnosisError) throw diagnosisError;

    // Insert into diagnosis_details table
    const { error: detailsError } = await supabase
      .from("diagnosis_details")
      .insert({
        diagnosis_id: result.id,
        symptoms: result.symptoms,
        treatment_options: result.treatmentOptions,
        product_recommendations: result.productRecommendations,
      });

    if (detailsError) throw detailsError;
  } catch (error) {
    console.error("Error saving diagnosis to database:", error);
    throw new Error("Failed to save diagnosis results");
  }
}

/**
 * Gets the user's diagnosis history from Supabase
 */
export async function getDiagnosisHistory(): Promise<DiagnosisResult[]> {
  try {
    // Get diagnoses from Supabase
    const { data: diagnoses, error: diagnosesError } = await supabase
      .from("diagnoses")
      .select("*")
      .order("created_at", { ascending: false });

    if (diagnosesError) throw diagnosesError;
    if (!diagnoses) return [];

    // Get details for each diagnosis
    const diagnosisResults: DiagnosisResult[] = [];

    for (const diagnosis of diagnoses) {
      const { data: details, error: detailsError } = await supabase
        .from("diagnosis_details")
        .select("*")
        .eq("diagnosis_id", diagnosis.id)
        .single();

      if (detailsError && detailsError.code !== "PGRST116") {
        console.error("Error fetching diagnosis details:", detailsError);
        continue;
      }

      diagnosisResults.push({
        id: diagnosis.id,
        isHealthy: diagnosis.is_healthy,
        diseaseName: diagnosis.disease_name || undefined,
        confidenceScore: diagnosis.confidence_score,
        description: diagnosis.description,
        symptoms: details?.symptoms || [],
        treatmentOptions: details?.treatment_options || [],
        productRecommendations: details?.product_recommendations || [],
        plantType: diagnosis.plant_type,
        imageUrl: diagnosis.image_path,
        timestamp: diagnosis.created_at,
      });
    }

    return diagnosisResults;
  } catch (error) {
    console.error("Error retrieving diagnosis history:", error);
    return [];
  }
}

/**
 * Gets a specific diagnosis by ID
 */
export async function getDiagnosisById(
  id: string,
): Promise<DiagnosisResult | null> {
  try {
    // Get diagnosis from Supabase
    const { data: diagnosis, error: diagnosisError } = await supabase
      .from("diagnoses")
      .select("*")
      .eq("id", id)
      .single();

    if (diagnosisError) throw diagnosisError;
    if (!diagnosis) return null;

    // Get details
    const { data: details, error: detailsError } = await supabase
      .from("diagnosis_details")
      .select("*")
      .eq("diagnosis_id", id)
      .single();

    if (detailsError && detailsError.code !== "PGRST116") {
      console.error("Error fetching diagnosis details:", detailsError);
    }

    return {
      id: diagnosis.id,
      isHealthy: diagnosis.is_healthy,
      diseaseName: diagnosis.disease_name || undefined,
      confidenceScore: diagnosis.confidence_score,
      description: diagnosis.description,
      symptoms: details?.symptoms || [],
      treatmentOptions: details?.treatment_options || [],
      productRecommendations: details?.product_recommendations || [],
      plantType: diagnosis.plant_type,
      imageUrl: diagnosis.image_path,
      timestamp: diagnosis.created_at,
    };
  } catch (error) {
    console.error("Error retrieving diagnosis:", error);
    return null;
  }
}

/**
 * Deletes a diagnosis from history
 */
export async function deleteDiagnosisFromHistory(id: string): Promise<void> {
  try {
    // Get the image path before deleting
    const { data: diagnosis } = await supabase
      .from("diagnoses")
      .select("image_path")
      .eq("id", id)
      .single();

    // Delete from diagnoses table (will cascade to diagnosis_details)
    const { error } = await supabase.from("diagnoses").delete().eq("id", id);

    if (error) throw error;

    // Delete the image from storage if it exists
    if (
      diagnosis?.image_path &&
      !diagnosis.image_path.includes("unsplash.com")
    ) {
      try {
        const url = new URL(diagnosis.image_path);
        const pathParts = url.pathname.split("/");
        const filename = pathParts[pathParts.length - 1];

        if (filename) {
          await supabase.storage.from("plant-images").remove([filename]);
        }
      } catch (err) {
        console.error("Error parsing image URL for deletion:", err);
      }
    }
  } catch (error) {
    console.error("Error deleting diagnosis:", error);
    throw new Error("Failed to delete diagnosis");
  }
}

/**
 * Submits user feedback on a diagnosis
 */
export async function submitDiagnosisFeedback(
  diagnosisId: string,
  isHelpful: boolean,
  comments?: string,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("diagnosis_details")
      .update({
        feedback_helpful: isHelpful,
        feedback_comments: comments || null,
      })
      .eq("diagnosis_id", diagnosisId);

    if (error) throw error;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw new Error("Failed to submit feedback");
  }
}

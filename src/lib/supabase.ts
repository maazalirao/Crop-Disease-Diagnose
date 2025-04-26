import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Default fallback values for when environment variables are missing
const DEFAULT_SUPABASE_URL = "https://tndkcdvhuczaalqfidhn.supabase.co";

// Get the Supabase URL from environment variables or use the fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;

// Get the Supabase anon key from environment variables or use a placeholder
// Note: The client will work for public data access even with an empty anon key
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create the Supabase client with error handling
let supabaseInstance: ReturnType<typeof createClient<Database>>;

try {
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  console.log("Supabase client initialized successfully");
} catch (error) {
  console.error("Error initializing Supabase client:", error);
  // Create a fallback client with default values
  supabaseInstance = createClient<Database>(DEFAULT_SUPABASE_URL, "");
}

export const supabase = supabaseInstance;

// Export a helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

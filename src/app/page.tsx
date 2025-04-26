"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Database,
  History,
  ArrowRight,
  Leaf,
  Zap,
  Shield,
  Microscope,
} from "lucide-react";
import dynamic from "next/dynamic";
import { analyzePlantImage } from "@/lib/api";

// Dynamically import the ImageUploadSection to improve initial load time
const ImageUploadSection = dynamic(
  () => import("@/components/ImageUploadSection"),
  {
    loading: () => (
      <div className="w-full h-[400px] bg-card rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading upload section...</p>
      </div>
    ),
    ssr: false, // Disable server-side rendering for camera functionality
  }
);

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const handleImageSubmit = async (image: File) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Analyze the image using our CNN/NLP model
      const result = await analyzePlantImage(image);

      // Redirect to the diagnosis detail page
      router.push(`/diagnosis/${result.id}`);
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process image. Please try again.");
      setIsProcessing(false);
    }
  };

  const scrollToUploadSection = () => {
    if (uploadSectionRef.current) {
      uploadSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Plant Disease Detection & Treatment
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Upload or capture photos of your plants and get instant
                AI-powered diagnosis with CNN and NLP technology.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={scrollToUploadSection}
              >
                <Microscope className="h-4 w-4" />
                Diagnose My Plant
              </Button>
              <Link href="/disease-database">
                <Button size="lg" variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  Browse Disease Database
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Image Upload Section - SINGLE ENTRY POINT FOR DIAGNOSIS */}
      <section 
        className="w-full py-12 md:py-16 lg:py-20 bg-muted/10" 
        id="upload-section"
        ref={uploadSectionRef}
      >
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-[800px]">
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                AI-Powered Plant Disease Diagnosis
              </h2>
              <p className="text-muted-foreground mt-2">
                Upload or capture a photo of your plant for CNN-based disease detection and NLP analysis
              </p>
            </div>

            <Suspense fallback={
              <div className="w-full h-[400px] bg-card rounded-lg animate-pulse flex items-center justify-center">
                <p className="text-muted-foreground">Loading upload section...</p>
              </div>
            }>
              <ImageUploadSection
                onImageSubmit={handleImageSubmit}
                isProcessing={isProcessing}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Key Features
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Our advanced CNN and NLP technology helps you identify and treat plant
                diseases quickly and effectively.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>CNN-Powered Diagnosis</CardTitle>
                <CardDescription>
                  Our convolutional neural network model accurately identifies plant
                  diseases from your photos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Get instant results with high confidence levels based on our
                  extensive training dataset of 50,000+ plant disease images.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="gap-1"
                  onClick={scrollToUploadSection}
                >
                  Try it now <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <Leaf className="h-10 w-10 text-primary mb-2" />
                <CardTitle>NLP Treatment Analysis</CardTitle>
                <CardDescription>
                  Natural Language Processing provides detailed, actionable advice for treating identified
                  issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our NLP engine generates specific product recommendations, application methods, and
                  preventative measures tailored to your plant's condition.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="gap-1"
                  onClick={scrollToUploadSection}
                >
                  Get recommendations <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Disease Database</CardTitle>
                <CardDescription>
                  Access our comprehensive library of plant diseases and
                  treatments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Browse through detailed information about symptoms, causes,
                  and remedies for common plant diseases.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/disease-database">
                  <Button variant="ghost" className="gap-1">
                    Explore database <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Start Diagnosing Your Plants Today
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Let our CNN-based analysis help identify problems early and keep your plants healthy.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/history">
                <Button size="lg" variant="outline" className="gap-2">
                  <History className="h-4 w-4" />
                  View Diagnosis History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

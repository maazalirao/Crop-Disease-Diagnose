"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Camera, X, Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ImageUploadSectionProps {
  onImageSubmit?: (image: File) => Promise<void>;
  isProcessing?: boolean;
}

const ImageUploadSection = ({
  onImageSubmit = async () => {},
  isProcessing = false,
}: ImageUploadSectionProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file selection
  const handleFileChange = useCallback((file: File | null) => {
    setError(null);

    if (!file) {
      setSelectedImage(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, etc.).");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB.");
      return;
    }

    setSelectedImage(file);
    
    // Clean up previous preview URL if it exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [previewUrl]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Start camera capture
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access not supported in this browser");
      }

      // Stop any existing camera stream
      stopCamera();
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
        }
      } catch (cameraError) {
        console.warn(
          `Could not access ${cameraFacing} camera, trying alternative`,
          cameraError
        );
        
        // Try the other camera if first one fails
        const newFacing = cameraFacing === "environment" ? "user" : "environment";
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: newFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
          setCameraFacing(newFacing);
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Could not access camera. Please check permissions or try uploading an image instead."
      );
      setActiveTab("upload");
    }
  };

  // Toggle camera facing mode
  const toggleCameraFacing = async () => {
    const newFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(newFacing);
    
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame to the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              handleFileChange(file);
              stopCamera();
              setActiveTab("preview");
            }
          },
          "image/jpeg",
          0.95
        );
      }
    }
  };

  // Handle camera tab selection
  const handleCameraTabSelect = () => {
    setActiveTab("camera");
    startCamera();
  };

  // Trigger file selection dialog
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Clear selected image
  const clearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null);
    setActiveTab("upload");
  };

  // Submit image for processing
  const submitImage = async () => {
    if (!selectedImage) return;

    try {
      await onImageSubmit(selectedImage);
    } catch (err) {
      setError("Failed to process image. Please try again.");
      console.error(err);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card" id="upload-section">
      <CardHeader>
        <CardTitle className="text-2xl">Plant Disease Detection</CardTitle>
        <CardDescription>
          Upload or capture an image of your plant to detect diseases and get
          treatment recommendations.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" disabled={isProcessing}>Upload</TabsTrigger>
            <TabsTrigger value="camera" disabled={isProcessing} onClick={handleCameraTabSelect}>Camera</TabsTrigger>
            {previewUrl && (
              <TabsTrigger value="preview" disabled={isProcessing}>Preview</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 md:p-10 text-center flex flex-col items-center justify-center h-72 md:h-96 transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <Upload className="h-12 w-12 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">Drag & drop your image here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Supports JPG, PNG, WEBP (max 10MB)
              </p>
              <Button onClick={handleFileButtonClick} disabled={isProcessing}>
                Browse Files
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="camera" className="mt-4">
            <div className="flex flex-col items-center">
              <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex mt-4 gap-4">
                <Button variant="outline" onClick={toggleCameraFacing} disabled={!isCameraActive}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Switch Camera
                </Button>
                <Button onClick={capturePhoto} disabled={!isCameraActive}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            {previewUrl && (
              <div className="flex flex-col items-center">
                <div className="border rounded-lg overflow-hidden w-full max-h-96">
                  <img
                    src={previewUrl}
                    alt="Plant Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  <Button variant="outline" onClick={clearImage} disabled={isProcessing}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button onClick={submitImage} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Analyze Plant
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-center border-t pt-6">
        {selectedImage && activeTab !== "preview" && (
          <Button 
            variant="default" 
            onClick={() => setActiveTab("preview")}
            disabled={isProcessing}
          >
            Continue with Selected Image
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ImageUploadSection;

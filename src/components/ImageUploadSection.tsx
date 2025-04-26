"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, Camera, X, Check, Loader2 } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Clean up the object URL when component unmounts
    return () => URL.revokeObjectURL(url);
  }, []);

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

      // First try with environment facing camera (rear camera)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
        }
      } catch (envError) {
        console.warn(
          "Could not access environment camera, trying user camera",
          envError,
        );

        // Fallback to user facing camera (front camera)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Could not access camera. Please check permissions or try uploading an image instead.",
      );
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
              const file = new File([blob], "camera-capture.jpg", {
                type: "image/jpeg",
              });
              handleFileChange(file);
              stopCamera();
            }
          },
          "image/jpeg",
          0.95,
        );
      }
    }
  };

  // Handle camera capture button click
  const handleCameraCapture = () => {
    if (typeof navigator.mediaDevices?.getUserMedia !== "function") {
      // Fallback for browsers that don't support MediaDevices API
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.onchange = (e) =>
        handleInputChange(e as React.ChangeEvent<HTMLInputElement>);
      input.click();
    } else {
      startCamera();
    }
  };

  // Clear selected image
  const clearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setError(null);
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

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      stopCamera();
    };
  }, [previewUrl]);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card">
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

        {isCameraActive ? (
          <div className="relative rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto max-h-[500px] object-contain bg-black"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <Button onClick={stopCamera} variant="outline">
                Cancel
              </Button>
              <Button onClick={capturePhoto}>
                <Camera className="mr-2 h-4 w-4" /> Capture
              </Button>
            </div>
          </div>
        ) : !previewUrl ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${dragActive ? "border-primary bg-primary/5" : "border-border"}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  Drag and drop your image here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or use one of the options below
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <Button
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Image
                </Button>
                <Button variant="outline" onClick={handleCameraCapture}>
                  <Camera className="mr-2 h-4 w-4" /> Take Photo
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Plant preview"
              className="w-full h-auto max-h-[400px] object-contain bg-black/5"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {previewUrl && (
        <CardFooter className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={clearImage}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={submitImage}
            disabled={isProcessing || !selectedImage}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Analyze Plant
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ImageUploadSection;

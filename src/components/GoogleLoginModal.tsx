"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccess?: (user: any) => void;
}

export default function GoogleLoginModal({
  isOpen,
  onCloseAction,
  onSuccess,
}: GoogleLoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginStep, setLoginStep] = useState<"select" | "loading" | "success">(
    "select"
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    { src: "/chrome.png", alt: "Google Chrome" },
    { src: "/chrome2.png", alt: "Second Image" },
    { src: "/chrome3.png", alt: "Third Image" },
  ];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Continuous rotation with smooth motion
  useEffect(() => {
    if (loginStep === "select" && isOpen) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 2000); // Faster rotation for more continuous feel

      return () => clearInterval(interval);
    }
  }, [loginStep, isOpen, images.length]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setLoginStep("loading");

      // Simulate Google OAuth flow (frontend only)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock Google user data for demo purposes
      const googleUser = {
        id: "google_" + Date.now(),
        email: "user@gmail.com",
        name: "Google User",
        picture: "https://via.placeholder.com/150",
        role: "employee",
        department: "IT",
        position: "Software Developer",
        branch: "Main Branch",
        isActive: true,
        lastLogin: new Date().toISOString(),
        googleId: "google_" + Date.now(),
      };

      setLoginStep("success");

      // Don't auto-close - let user click confirm button instead
    } catch (err) {
      console.error("Google login error:", err);
      setLoginStep("select");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && !isLoading) {
      setLoginStep("select");
      onCloseAction();
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        .image-transition {
          transition: all 0.5s ease-in-out;
        }
        .image-fade {
          transition: opacity 6.5s ease-in-out, transform 5.5s ease-in-out;
        }
        .carousel-wrapper {
          overflow: hidden;
          position: relative;
        }
        .carousel-track {
          display: flex;
          width: 600%; /* 6 slides (3 original + 3 duplicated) */
        }
        .carousel-track.looping {
          animation: continuousSlide 3s linear infinite;
        }
        @keyframes continuousSlide {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          } /* Move by half the track width */
        }
        /* Individual image animations */
        .carousel-track {
          animation: slideWithPause 6s linear infinite;
        }
        .center-image {
          animation: centerSlide 6s ease-in-out infinite;
        }
        .left-image {
          animation: leftSlide 6s ease-in-out infinite;
        }
        .right-image {
          animation: rightSlide 6s ease-in-out infinite;
        }

        @keyframes slideWithPause {
          0% {
            transform: translateX(0%);
          }
          16.66% {
            transform: translateX(-50%);
          }
          83.33% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes centerSlide {
          0%,
          16.66% {
            transform: translateX(0%);
          }
          83.33%,
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes leftSlide {
          0%,
          16.66% {
            transform: translateX(0%);
          }
          83.33%,
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes rightSlide {
          0%,
          16.66% {
            transform: translateX(0%);
          }
          83.33%,
          100% {
            transform: translateX(-50%);
          }
        }
        .carousel-slide {
          width: 16.666%; /* 100% / 6 slides */
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .image-container {
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }

        /* Modal backdrop animation */
        [data-radix-dialog-overlay] {
          animation: modalBackdropIn 0.3s ease-out;
        }

        @keyframes modalBackdropIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Modal content animation - Slow Motion Popup */
        .modal-zoom-in {
          animation: modalSlowMotion 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes modalSlowMotion {
          0% {
            opacity: 0;
            transform: scale(0.05) translateY(-200px) rotate(-10deg);
          }
          15% {
            opacity: 0.3;
            transform: scale(0.2) translateY(-150px) rotate(-8deg);
          }
          30% {
            opacity: 0.5;
            transform: scale(0.4) translateY(-100px) rotate(-5deg);
          }
          45% {
            opacity: 0.7;
            transform: scale(0.6) translateY(-50px) rotate(-2deg);
          }
          60% {
            opacity: 0.85;
            transform: scale(0.8) translateY(-20px) rotate(1deg);
          }
          75% {
            opacity: 0.95;
            transform: scale(0.95) translateY(-5px) rotate(-0.5deg);
          }
          85% {
            opacity: 1;
            transform: scale(1.08) translateY(3px) rotate(0.3deg);
          }
          95% {
            opacity: 1;
            transform: scale(0.99) translateY(-1px) rotate(-0.1deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotate(0deg);
          }
        }

        /* Ultra slow motion bounce effect */
        .modal-bounce {
          animation: modalUltraSlowBounce 3.2s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes modalUltraSlowBounce {
          0% {
            opacity: 0;
            transform: scale(0.02) translateY(-300px) rotate(-15deg);
          }
          10% {
            opacity: 0.2;
            transform: scale(0.1) translateY(-250px) rotate(-12deg);
          }
          20% {
            opacity: 0.4;
            transform: scale(0.25) translateY(-200px) rotate(-8deg);
          }
          30% {
            opacity: 0.6;
            transform: scale(0.4) translateY(-150px) rotate(-5deg);
          }
          40% {
            opacity: 0.75;
            transform: scale(0.55) translateY(-100px) rotate(-2deg);
          }
          50% {
            opacity: 0.85;
            transform: scale(0.7) translateY(-60px) rotate(1deg);
          }
          60% {
            opacity: 0.92;
            transform: scale(0.85) translateY(-30px) rotate(-0.5deg);
          }
          70% {
            opacity: 0.96;
            transform: scale(0.95) translateY(-10px) rotate(0.3deg);
          }
          80% {
            opacity: 0.98;
            transform: scale(1.02) translateY(2px) rotate(-0.1deg);
          }
          90% {
            opacity: 1;
            transform: scale(1.05) translateY(5px) rotate(0.2deg);
          }
          95% {
            opacity: 1;
            transform: scale(0.98) translateY(-2px) rotate(-0.1deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotate(0deg);
          }
        }

        /* Modal popup animation */
        @keyframes modalPopup {
          0% {
            transform: scale(0.8) translateY(20px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(-5px);
            opacity: 0.9;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        @keyframes modalPopdown {
          0% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          100% {
            transform: scale(0.8) translateY(20px);
            opacity: 0;
          }
        }
      `}</style>
      <Dialog open={isOpen} onOpenChangeAction={handleClose}>
        <DialogContent
          className="sm:max-w-md mx-auto my-8 px-6 py-4"
          style={{
            animation: isOpen
              ? "modalPopup 0.4s ease-out"
              : "modalPopdown 0.3s ease-in",
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              {loginStep === "select" && "Continue with Google"}
              {loginStep === "loading" && "Signing you in..."}
              {loginStep === "success" && "Feature Under Development"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-6 py-6">
            {loginStep === "select" && (
              <>
                <div className="w-full">
                  <div className="relative w-full">
                    <div className="w-full max-w-sm mx-auto">
                      {/* All 3 images side by side */}
                      <div className="w-full max-w-sm mx-auto">
                        <div className="relative flex items-center justify-center h-20 w-80 mx-auto overflow-hidden">
                          {images.map((image, index) => {
                            // Calculate which position this image should be in
                            const position =
                              (index - currentSlide + images.length) %
                              images.length;

                            // Define positions with more fluid motion
                            const positions = [
                              {
                                x: -80,
                                scale: 0.7,
                                blur: "blur-md",
                                opacity: 0.6,
                              }, // Left
                              { x: 0, scale: 1.2, blur: "blur-0", opacity: 1 }, // Center
                              {
                                x: 80,
                                scale: 0.7,
                                blur: "blur-md",
                                opacity: 0.6,
                              }, // Right
                            ];

                            const pos = positions[position];

                            return (
                              <div
                                key={index}
                                className="absolute transition-all duration-1000 ease-out"
                                style={{
                                  transform: `translateX(${pos.x}px) scale(${pos.scale})`,
                                  left: "50%",
                                  marginLeft: "-32px",
                                  opacity: pos.opacity,
                                  zIndex: position === 1 ? 10 : 1,
                                }}
                              >
                                <div className="flex items-center justify-center transition-all duration-1000">
                                  <img
                                    src={image.src}
                                    alt={image.alt}
                                    className={`w-16 h-16 transition-all duration-1000 ${pos.blur}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-gray-600">
                    Sign in with your SMCT Google account to access the SMCT
                    Evaluation System
                  </p>
                  <p className="text-sm text-gray-500">
                    Your account will be automatically created if it doesn't
                    exist
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <Button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white  border border-gray-300 text-black hover:text-white hover:bg-gray-500 cursor-pointer hover:scale-110 transition-all duration-300"
                    disabled={isLoading}
                  >
                    <img
                      src="/chrome.png"
                      alt="Google"
                      className="w-5 h-5 mr-2"
                    />
                    Continue with Google
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onCloseAction}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:text-white cursor-pointer hover:scale-110 transition-all duration-300"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {loginStep === "loading" && (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-gray-600 font-medium">
                    Connecting to Google...
                  </p>
                  <p className="text-sm text-gray-500">
                    Please wait while we authenticate your account
                  </p>
                </div>
              </>
            )}

            {loginStep === "success" && (
              <>
                <div className="flex items-center justify-center ">
                  <img
                    src="/devpp.gif"
                    alt="Shield animation"
                    className="w-25 h-25"
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-gray-600 font-medium">
                    This feature is under development and will be updated soon.
                  </p>
                  <p className="text-sm text-gray-500">
                    Thank you for your kind consideration.
                  </p>
                </div>

                <div className="w-full pt-4">
                  <Button
                    onClick={() => {
                      setLoginStep("select");
                      onCloseAction();
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-110 transition-all duration-300"
                  >
                    Confirm
                  </Button>
                </div>
              </>
            )}
          </div>

          {loginStep === "select" && (
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

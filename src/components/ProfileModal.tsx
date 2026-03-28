import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserProfile } from "./ProfileCard";
import { User, Save, X } from "lucide-react";
// Removed profileService import - we'll use UserContext directly
import SignaturePad, { SignaturePadRef } from "@/components/SignaturePad";
import { useToast } from "@/hooks/useToast";
import LoadingAnimation from "@/components/LoadingAnimation";
import apiService from "@/lib/apiService";
import { dataURLtoFile } from "../utils/data-url-to-file";

import { useAuth } from "@/contexts/UserContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (updatedProfile: UserProfile | null) => void;
}

interface Account {
  username?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
  signature?: string | null;
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileModalProps) {
  const [formData, setFormData] = useState<Account | null>({
    username: "",
    email: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
    signature: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success } = useToast();
  const { refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const initializedProfileIdRef = useRef<string | number | null>(null); // Track which profile ID we've initialized
  
  // Reset form data when modal opens or profile changes
  useEffect(() => {
    // Only initialize when modal opens and we haven't initialized yet, or when profile ID changes
    if (isOpen && profile?.id) {
      // Check if this is a different profile or first time opening
      if (initializedProfileIdRef.current !== profile.id) {
        setFormData((prev) => ({
          ...prev,
          username: profile?.username || "",
          email: profile?.email || "",
        }));
        initializedProfileIdRef.current = profile.id; // Store profile ID to track changes
      }
    }
    
    // Reset initialization flag when modal closes
    if (!isOpen) {
      initializedProfileIdRef.current = null;
    }
  }, [isOpen, profile?.id, profile?.username, profile?.email]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Current password validation removed - no uppercase/lowercase/number requirements

    if (formData?.new_password && String(formData?.new_password).length < 8) {
      newErrors.new_password = "Password must be at least 8 characters";
    } else if (
      formData?.new_password &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.new_password)
    ) {
      newErrors.new_password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (
      formData?.confirm_password &&
      String(formData?.confirm_password).length < 8
    ) {
      newErrors.confirm_password = "Password must be at least 8 characters";
    } else if (
      formData?.confirm_password &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.confirm_password)
    ) {
      newErrors.confirm_password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (
      formData?.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Add a small delay to show the loading animation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const formDataToUpload = new FormData();
      formDataToUpload.append("username", formData?.username || "");
      formDataToUpload.append("email", formData?.email || "");
      formDataToUpload.append(
        "current_password",
        formData?.current_password || ""
      );
      formDataToUpload.append("new_password", formData?.new_password || "");
      formDataToUpload.append(
        "confirm_password",
        formData?.confirm_password || ""
      );
      // Get the current signature from SignaturePad (may be local, not in formData yet)
      const currentSignature = signaturePadRef.current?.getSignature() || formData?.signature || null;
      console.log("test", currentSignature);

      if (currentSignature) {
        const signature = dataURLtoFile(currentSignature, "signature.png");
        if (signature) {
          formDataToUpload.append("signature", signature);
        }
      } else if (currentSignature === null || currentSignature === "") {
        formDataToUpload.append("signature", "");
      }

      await apiService.updateEmployee_auth(formDataToUpload);

      // Show success toast
      success("Profile updated successfully!");

      // Refresh user profile to get updated data (only once, after successful save)
      // Use a small delay to ensure the API has processed the update
      setTimeout(() => {
        refreshUser();
      }, 100);
      
      // Reset initialization flag so form reloads with new data next time
      initializedProfileIdRef.current = null;
      onClose();

      // Close modal after a brief delay to ensure state is updated
    } catch (error: any) {
      setOpen(true);
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};

        Object.keys(error.response.data.errors).forEach((field) => {
          backendErrors[field] = error.response.data.errors[field][0];
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Don't refresh user on cancel - it's unnecessary and can cause re-renders
    // The profile prop will already have the latest data
    setErrors({});
    // Reset initialization flag so form reloads with fresh data next time
    initializedProfileIdRef.current = null;
    onClose();
  };

  const handleRequestReset = async () => {
    try {
      setIsLoading(true);
      await apiService.requestSignatureReset();
      // After successful reset request, wait for admin approval
      // Don't enable Clear Signature yet - user must wait for approval
      success(
        "Signature reset request submitted successfully! Please wait for admin approval. You will be able to clear your signature once approved."
      );
      // Refresh user after a small delay to get updated requestSignatureReset status
      // This is needed for the SignaturePad polling to work correctly
      setTimeout(() => {
        refreshUser();
      }, 100);
    } catch (error: any) {
      console.error("Error requesting signature reset:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to request signature reset. Please try again.";
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChangeAction={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-6 py-6 animate-popup">
        {/* Sticky Cancel and Save Buttons - Stay at top when scrolling */}
        <div className="sticky top-0 z-50 flex justify-end gap-2 mb-4 -mr-6 pr-6 py-4 no-print">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 hover:text-white text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <X className="w-5 h-5 text-white" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <LoadingAnimation size="sm" variant="spinner" color="white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>

        <DialogHeader className="px-1 ">
          <DialogTitle className="flex items-center gap-2 text-xl bg-blue-200 px-3 py-2 rounded-lg">
            <User className="w-5 h-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-0">
          {/* Avatar Section */}
          <div className="flex flex-col mt-7 items-center space-y-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                <img
                  src="/user.png"
                  alt={profile?.fname[0] || "Profile"}
                  className="h-25 w-25 rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mt-10">
              This fields is read only :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fname" className="text-sm font-medium">
                  First Name
                </Label>
                <Input id="fname" value={profile?.fname} readOnly />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lname" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input id="lname" value={profile?.lname} readOnly />
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <Label htmlFor="contact" className="text-sm font-medium">
                  Contact
                </Label>
                <Input
                  id="contact"
                  type="number"
                  value={profile?.contact || ""}
                  readOnly
                />
              </div>

              {/* Role/Position */}
              {profile?.roles[0].name !== "admin" && (
                <>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="roleOrPosition"
                      className="text-sm font-medium"
                    >
                      Position
                    </Label>
                    <Input
                      value={profile?.positions?.label || "Not Assigned "}
                      readOnly
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department
                    </Label>
                    <Input
                      value={
                        profile?.departments?.department_name || "Not Assigned "
                      }
                      readOnly
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="branch" className="text-sm font-medium">
                      Branch
                    </Label>
                    <Input
                      value={
                        profile?.branches[0]?.branch_name || "Not Assigned "
                      }
                      readOnly
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <p
              className="text-sm text-blue-700 mt-10 cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              Edit Account Settings ...
            </p>

            <div
              className={`${
                open ? "max-h-[30vh]" : "max-h-0"
              } overflow-hidden transition-all duration-400 mt-2`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData?.username || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value,
                      })
                    }
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={formData?.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Current Password
                  </Label>
                  <Input
                    id="current_password"
                    type="password"
                    placeholder="******"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_password: e.target.value,
                      })
                    }
                  />
                  {errors.current_password && (
                    <p className="text-sm text-red-500">
                      {errors.current_password}
                    </p>
                  )}
                </div>

                {/* New Password */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="******"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        new_password: e.target.value,
                      })
                    }
                  />
                  {errors.new_password && (
                    <p className="text-sm text-red-500">
                      {errors.new_password}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="******"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                  {errors.confirm_password && (
                    <p className="text-sm text-red-500">
                      {errors.confirm_password}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Digital Signature */}
          <Label htmlFor="signature" className="text-sm font-medium">
            Digital Signature{" "}
          </Label>
          <div className="space-y-2">
            <SignaturePad
              ref={signaturePadRef}
              value={profile?.signature || formData?.signature || null}
              onChangeAction={(signature) => {
                // Only update formData when signature is cleared (null)
                // For new signatures, they're stored locally until Save is clicked
                if (signature === null) {
                  setFormData({ ...formData, signature: null });
                }
              }}
              className="w-full"
              required={true}
              hasError={false}
              onRequestReset={handleRequestReset}
            />
            {errors.signature && (
              <p className="text-sm text-red-500">{errors.signature}</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Update your digital signature for official documents and approvals.
            
           
          </p>
          <p className="text-sm text-gray-700"><span className="font-bold">Note:</span> If you are unsure about your new signature, 
          please do not click Save yet. Clearing your signature will reset it to the default signature</p>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

        </form>
      </DialogContent>
    </Dialog>
  );
}

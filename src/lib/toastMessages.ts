import { toast } from "sonner";

// Common toast messages for the Pro-Eval system
export const toastMessages = {
  // Authentication
  login: {
    success: (username: string) =>
      toast.success("Login Successful!", {
        description: `Welcome back, ${username}!`,
        duration: 3000,
      }),
    error: (message: string) =>
      toast.error("Login Failed", {
        description: message,
        duration: 4000,
      }),
    networkError: () =>
      toast.error("Connection Error", {
        description:
          "Unable to connect to the server. Please check your internet connection.",
        duration: 5000,
      }),
  },

  // User Management
  user: {
    created: (username: string) =>
      toast.success("User Created", {
        description: `${username} has been successfully created.`,
        duration: 3000,
      }),
    updated: (username: string) =>
      toast.success("User Updated", {
        description: `${username}'s information has been updated.`,
        duration: 3000,
      }),
    deleted: (username: string) =>
      toast.success("User Deleted", {
        description: `${username} has been removed from the system.`,
        duration: 3000,
      }),
    approved: (username: string) =>
      toast.success("User Approved", {
        description: `${username} can now access the system.`,
        duration: 3000,
      }),
    rejected: (username: string) =>
      toast.warning("User Rejected", {
        description: `${username}'s registration has been rejected.`,
        duration: 4000,
      }),
    reinstated: (username: string) =>
      toast.success("User Reinstated", {
        description: `${username} has been reinstated and can access the system again.`,
        duration: 3000,
      }),
    suspended: (username: string) =>
      toast.warning("User Suspended", {
        description: `${username} has been suspended and cannot access the system.`,
        duration: 4000,
      }),
    activated: (username: string) =>
      toast.success("User Activated", {
        description: `${username}'s account has been activated.`,
        duration: 3000,
      }),
    deactivated: (username: string) =>
      toast.warning("User Deactivated", {
        description: `${username}'s account has been deactivated.`,
        duration: 4000,
      }),
  },

  // Evaluation System
  evaluation: {
    saved: () =>
      toast.success("Evaluation Saved", {
        description: "Your evaluation has been saved successfully.",
        duration: 3000,
      }),
    submitted: () =>
      toast.success("Evaluation Submitted", {
        description: "Your evaluation has been submitted for review.",
        duration: 3000,
      }),
    completed: (employeeName: string) =>
      toast.success("Evaluation Completed", {
        description: `Evaluation for ${employeeName} has been completed.`,
        duration: 3000,
      }),
    deleted: (employeeName: string) =>
      toast.success("Evaluation Deleted", {
        description: `Evaluation for ${employeeName} has been deleted.`,
        duration: 3000,
      }),
    error: () =>
      toast.error("Evaluation Error", {
        description: "Failed to save evaluation. Please try again.",
        duration: 4000,
      }),
  },

  // File Operations
  file: {
    uploaded: (filename: string) =>
      toast.success("File Uploaded", {
        description: `${filename} has been uploaded successfully.`,
        duration: 3000,
      }),
    uploadError: () =>
      toast.error("Upload Failed", {
        description: "Failed to upload file. Please try again.",
        duration: 4000,
      }),
    deleted: (filename: string) =>
      toast.success("File Deleted", {
        description: `${filename} has been removed.`,
        duration: 3000,
      }),
  },

  // System Operations
  system: {
    dataRefreshed: () =>
      toast.info("Data Refreshed", {
        description: "Latest data has been loaded.",
        duration: 2000,
      }),
    settingsSaved: () =>
      toast.success("Settings Saved", {
        description: "Your preferences have been updated.",
        duration: 3000,
      }),
    exportStarted: () =>
      toast.info("Export Started", {
        description: "Your data export is being prepared...",
        duration: 3000,
      }),
    exportCompleted: () =>
      toast.success("Export Completed", {
        description: "Your data has been exported successfully.",
        duration: 3000,
      }),
  },

  // Form Operations
  form: {
    saved: () =>
      toast.success("Form Saved", {
        description: "Your changes have been saved.",
        duration: 2000,
      }),
    validationError: () =>
      toast.error("Validation Error", {
        description: "Please check all required fields.",
        duration: 4000,
      }),
    reset: () =>
      toast.info("Form Reset", {
        description: "Form has been reset to original values.",
        duration: 2000,
      }),
  },

  // Loading States
  loading: {
    saving: () =>
      toast.loading("Saving...", {
        description: "Please wait while we save your changes.",
      }),
    loading: () =>
      toast.loading("Loading...", {
        description: "Please wait while we fetch your data.",
      }),
    processing: () =>
      toast.loading("Processing...", {
        description: "Please wait while we process your request.",
      }),
  },

  // Generic Messages
  generic: {
    success: (message: string, description?: string) =>
      toast.success(message, {
        description,
        duration: 3000,
      }),
    error: (message: string, description?: string) =>
      toast.error(message, {
        description,
        duration: 4000,
      }),
    warning: (message: string, description?: string) =>
      toast.warning(message, {
        description,
        duration: 4000,
      }),
    info: (message: string, description?: string) =>
      toast.info(message, {
        description,
        duration: 3000,
      }),
  },
};

// Helper function to dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Helper function for promise-based operations
export const toastPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) => {
  return toast.promise(promise, messages);
};

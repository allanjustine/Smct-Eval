import { useState, useCallback } from 'react';
import { toastMessages } from '@/lib/toastMessages';

export interface ErrorInfo {
  message: string;
  code?: string | number;
  details?: any;
  timestamp: Date;
}

export interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  defaultErrorMessage?: string;
  onError?: (error: ErrorInfo) => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    logToConsole = true,
    defaultErrorMessage = 'An unexpected error occurred. Please try again.',
    onError,
  } = options;

  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isError, setIsError] = useState(false);

  /**
   * Handles an error by creating error info, logging, showing toast, and calling optional callback
   */
  const handleError = useCallback(
    (error: any, customMessage?: string, customTitle?: string) => {
      // Extract error information
      const errorInfo: ErrorInfo = {
        message: customMessage || error?.message || defaultErrorMessage,
        code: error?.status || error?.code || error?.statusCode,
        details: error,
        timestamp: new Date(),
      };

      // Log to console if enabled
      if (logToConsole) {
        console.error('Error handled:', errorInfo);
      }

      // Set error state
      setError(errorInfo);
      setIsError(true);

      // Show toast notification if enabled
      if (showToast) {
        const title = customTitle || 'Error';
        const message = errorInfo.message;
        toastMessages.generic.error(title, message);
      }

      // Call optional error callback
      if (onError) {
        onError(errorInfo);
      }

      return errorInfo;
    },
    [showToast, logToConsole, defaultErrorMessage, onError]
  );

  /**
   * Handles API errors with specific formatting
   */
  const handleApiError = useCallback(
    (error: any, operation?: string) => {
      let message = defaultErrorMessage;
      let title = 'Operation Failed';

      // Handle different error types
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      } else if (error?.status === 422) {
        // Validation errors
        title = 'Validation Error';
        message = 'Please check your input and try again.';
      } else if (error?.status === 401) {
        title = 'Authentication Error';
        message = 'You are not authorized to perform this action.';
      } else if (error?.status === 403) {
        title = 'Permission Denied';
        message = 'You do not have permission to perform this action.';
      } else if (error?.status === 404) {
        title = 'Not Found';
        message = 'The requested resource was not found.';
      } else if (error?.status === 500) {
        title = 'Server Error';
        message = 'An error occurred on the server. Please try again later.';
      } else if (error?.status >= 500) {
        title = 'Server Error';
        message = 'The server encountered an error. Please try again later.';
      } else if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
        title = 'Network Error';
        message = 'Unable to connect to the server. Please check your internet connection.';
      }

      if (operation) {
        title = `${operation} Failed`;
      }

      return handleError(error, message, title);
    },
    [defaultErrorMessage, handleError]
  );

  /**
   * Wraps an async function with error handling
   */
  const withErrorHandling = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options?: {
        successMessage?: string;
        successTitle?: string;
        errorMessage?: string;
        errorTitle?: string;
        onSuccess?: (data: T) => void;
        onError?: (error: any) => void;
        showSuccessToast?: boolean;
      }
    ): Promise<T | null> => {
      try {
        const result = await asyncFn();

        // Show success toast if enabled
        if (options?.showSuccessToast && options?.successMessage) {
          toastMessages.generic.success(
            options.successTitle || 'Success',
            options.successMessage
          );
        }

        // Call success callback
        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        // Clear any previous errors
        clearError();

        return result;
      } catch (error: any) {
        // Handle error
        if (options?.onError) {
          options.onError(error);
        } else {
          handleApiError(error, options?.errorTitle);
        }

        return null;
      }
    },
    [handleApiError]
  );

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  /**
   * Resets error state and executes a function
   */
  const resetAndExecute = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      clearError();
      return withErrorHandling(fn);
    },
    [clearError, withErrorHandling]
  );

  return {
    error,
    isError,
    handleError,
    handleApiError,
    withErrorHandling,
    clearError,
    resetAndExecute,
  };
};


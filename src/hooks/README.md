# Error Handling Guide

This guide explains how to use the reusable error handling utilities in the application.

## Overview

We provide three main error handling solutions:

1. **`useErrorHandler` Hook** - For handling async operations and API errors
2. **`error.tsx`** - Next.js error boundary for route-level errors
3. **`ErrorBoundary` Component** - React error boundary for component-level errors

## 1. useErrorHandler Hook

A custom React hook that provides consistent error handling across the application.

### Basic Usage

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

function MyComponent() {
  const { withErrorHandling, handleApiError } = useErrorHandler();

  const handleSave = async () => {
    await withErrorHandling(
      async () => {
        // Your async operation
        const result = await api.saveData();
        return result;
      },
      {
        successMessage: 'Data saved successfully!',
        errorTitle: 'Save Failed',
        showSuccessToast: true,
      }
    );
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Advanced Usage

```tsx
const { withErrorHandling, handleApiError, clearError } = useErrorHandler({
  showToast: true,        // Show toast notifications (default: true)
  logToConsole: true,     // Log errors to console (default: true)
  defaultErrorMessage: 'Custom default message',
  onError: (errorInfo) => {
    // Custom error handling (e.g., send to error tracking service)
    console.log('Error tracked:', errorInfo);
  },
});
```

### Methods

- **`withErrorHandling<T>(asyncFn, options?)`** - Wraps an async function with error handling
- **`handleError(error, customMessage?, customTitle?)`** - Handles any error
- **`handleApiError(error, operation?)`** - Handles API errors with smart formatting
- **`clearError()`** - Clears the current error state
- **`resetAndExecute(fn)`** - Clears error and executes a function

### Error State

```tsx
const { error, isError } = useErrorHandler();

// error: ErrorInfo | null
// isError: boolean
```

## 2. Next.js Error Boundary (error.tsx)

Next.js automatically uses `src/app/error.tsx` to catch errors in route segments.

**No setup required** - Next.js handles this automatically.

## 3. ErrorBoundary Component

Wrap components that might throw errors:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Optional: Log to error tracking service
        console.error('Component error:', error, errorInfo);
      }}
      fallback={<CustomErrorUI />} // Optional custom fallback
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Migration Example

### Before (Manual Error Handling)

```tsx
const handleSave = async () => {
  try {
    await clientDataService.updateEmployee(id, data);
    toastMessages.generic.success('Success', 'Updated successfully');
  } catch (error) {
    console.error('Error:', error);
    toastMessages.generic.error('Failed', 'Update failed');
  }
};
```

### After (Using useErrorHandler)

```tsx
const { withErrorHandling } = useErrorHandler();

const handleSave = async () => {
  await withErrorHandling(
    async () => {
      await clientDataService.updateEmployee(id, data);
    },
    {
      successMessage: 'Updated successfully',
      successTitle: 'Success',
      errorTitle: 'Update Failed',
      showSuccessToast: true,
    }
  );
};
```

## Best Practices

1. **Use `withErrorHandling` for async operations** - Simplifies error handling
2. **Use `handleApiError` for API calls** - Provides smart error formatting
3. **Wrap critical components with ErrorBoundary** - Prevents app crashes
4. **Customize error messages** - Provide user-friendly messages
5. **Log errors in development** - Helps with debugging

## Error Types Handled

- **API Errors** - HTTP status codes (400, 401, 403, 404, 500, etc.)
- **Network Errors** - Connection issues
- **Validation Errors** - 422 status codes
- **Generic Errors** - Any other errors


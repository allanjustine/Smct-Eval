import { useEffect } from 'react';

type AnimationType = 'dialog' | 'modal';

interface UseDialogAnimationOptions {
  duration?: number; // Animation duration in seconds (default: 0.4)
  type?: AnimationType; // Animation type: 'dialog' or 'modal' (default: 'dialog')
}

// Global style ID - shared across all components
const GLOBAL_STYLE_ID = 'dialog-animation-styles-global';
// Track if styles have been injected to avoid duplicate injection
let stylesInjected = false;

/**
 * Custom hook for dialog and modal popup animations
 * Injects CSS animation styles ONCE globally and returns the animation class name
 * 
 * Performance Benefits:
 * - Single style element shared across all components
 * - No duplicate CSS in the DOM
 * - Reduced memory usage
 * - Faster page load
 * 
 * @param options - Configuration options for the animation
 * @param options.duration - Animation duration in seconds (default: 0.4)
 * @param options.type - Animation type: 'dialog' for dialog popup or 'modal' for modal popup (default: 'dialog')
 * @returns The CSS class name to apply to the dialog/modal container
 * 
 * @example
 * ```tsx
 * // For dialogs (default)
 * const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });
 *
 * // For modals
 * const modalAnimationClass = useDialogAnimation({ type: 'modal', duration: 0.4 });
 *
 * <DialogContent className={`max-w-md p-6 ${dialogAnimationClass}`}>
 *   ...
 * </DialogContent>
 * ```
 */
export const useDialogAnimation = (options: UseDialogAnimationOptions = {}) => {
  const { duration = 0.4, type = 'dialog' } = options;
  const animationClass = type === 'modal' ? 'animate-modal-popup' : 'animate-dialog-popup';

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Only inject styles once globally
    if (stylesInjected || document.getElementById(GLOBAL_STYLE_ID)) {
      stylesInjected = true;
      return;
    }

    // Create and inject style element ONCE with both dialog and modal animations
    const styleElement = document.createElement('style');
    styleElement.id = GLOBAL_STYLE_ID;
    styleElement.textContent = `
      /* Dialog popup animation (default) */
      @keyframes dialogPopup {
        0% {
          transform: scale(0.85) translateY(-20px);
          opacity: 0;
        }
        60% {
          transform: scale(1.02) translateY(0);
          opacity: 1;
        }
        100% {  
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }
      .animate-dialog-popup {
        animation: dialogPopup ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
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
      .animate-modal-popup {
        animation: modalPopup ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
    `;
    document.head.appendChild(styleElement);
    stylesInjected = true;

    // Note: We don't clean up the style element on unmount because
    // it's shared across all components. It will be cleaned up when the page unloads.
  }, [duration]);

  return animationClass;
};


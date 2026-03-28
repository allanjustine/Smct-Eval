"use client";

import { useEffect } from "react";

/**
 * ImageProtection - Global component that prevents image dragging and copying
 * This component adds event listeners to prevent dragging images to external sites
 * (like Google reverse image search) and prevents context menu access
 */
export function ImageProtection() {
  useEffect(() => {
    // Helper function to check if target is an image
    const isImageElement = (target: EventTarget | null): boolean => {
      if (!target) return false;
      
      // Check if it's an HTML element with tagName
      if (target instanceof HTMLElement) {
        if (target.tagName === "IMG") return true;
        
        // Check if it's inside an img element
        try {
          if (typeof target.closest === "function") {
            return target.closest("img") !== null;
          }
        } catch (e) {
          // closest might throw in some edge cases
          return false;
        }
      }
      
      return false;
    };

    // Prevent drag events globally for images
    const preventImageDrag = (e: DragEvent) => {
      if (isImageElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevent context menu on images
    const preventImageContextMenu = (e: MouseEvent) => {
      if (isImageElement(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Prevent mouse down drag on images
    const preventImageMouseDown = (e: MouseEvent) => {
      if (isImageElement(e.target) && e.button === 0) {
        // Left mouse button
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener("dragstart", preventImageDrag, true);
    document.addEventListener("drag", preventImageDrag, true);
    document.addEventListener("dragend", preventImageDrag, true);
    document.addEventListener("dragover", preventImageDrag, true);
    document.addEventListener("drop", preventImageDrag, true);
    document.addEventListener("contextmenu", preventImageContextMenu, true);
    document.addEventListener("mousedown", preventImageMouseDown, true);

    // Also prevent selectstart for images
    const preventSelect = (e: Event) => {
      if (isImageElement(e.target)) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("selectstart", preventSelect, true);

    // Cleanup
    return () => {
      document.removeEventListener("dragstart", preventImageDrag, true);
      document.removeEventListener("drag", preventImageDrag, true);
      document.removeEventListener("dragend", preventImageDrag, true);
      document.removeEventListener("dragover", preventImageDrag, true);
      document.removeEventListener("drop", preventImageDrag, true);
      document.removeEventListener("contextmenu", preventImageContextMenu, true);
      document.removeEventListener("mousedown", preventImageMouseDown, true);
      document.removeEventListener("selectstart", preventSelect, true);
    };
  }, []);

  return null; // This component doesn't render anything
}


"use client";
import { useEffect } from "react";

export default function ImageProtection() {
  useEffect(() => {
    // 1. Disable right-click context menu globally
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Prevent image dragging
    const preventDrag = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    };

    // 3. Prevent text selection on images
    const preventSelect = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "IMG" || target?.tagName === "VIDEO") {
        return false;
      }
    };

    document.addEventListener("contextmenu", preventContextMenu, { capture: true });
    document.addEventListener("dragstart", preventDrag, { capture: true });
    document.addEventListener("selectstart", preventSelect, { capture: true });

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu, { capture: true });
      document.removeEventListener("dragstart", preventDrag, { capture: true });
      document.removeEventListener("selectstart", preventSelect, { capture: true });
    };
  }, []);

  return null;
}
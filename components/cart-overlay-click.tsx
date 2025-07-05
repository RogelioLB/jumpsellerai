"use client";

import { useEffect } from "react";
import { useCartSidebar } from "@/store/useCartSidebar";

export function CartOverlayClickHandler() {
  const { close } = useCartSidebar();

  useEffect(() => {
    // Función que maneja el clic en el documento
    const handleDocumentClick = (e: MouseEvent) => {
      // Verificar si el carrito está abierto
      const isCartOpen = document.documentElement.dataset.sidebarRightOpen === "true";
      
      if (!isCartOpen) return;
      
      // Comprobar si el clic fue en el overlay (fuera del sidebar)
      // El overlay es el pseudo-elemento ::before en el html
      // Podemos detectarlo verificando si el clic no está dentro del sidebar
      const cartSidebar = document.querySelector('[data-side="right"]');
      
      if (cartSidebar && !cartSidebar.contains(e.target as Node)) {
        // El clic fue fuera del sidebar, así que cerramos el carrito
        close();
      }
    };

    // Añadir event listener
    document.addEventListener("click", handleDocumentClick);

    // Limpiar event listener al desmontar el componente
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [close]);

  // Este componente no renderiza nada visual
  return null;
}

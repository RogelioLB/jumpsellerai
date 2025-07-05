"use client";

import { useEffect } from "react";
import { useCartSidebar } from "@/store/useCartSidebar";

// Este componente añade una solución específica para dispositivos móviles
// Asegura que el sidebar del carrito sea visible en todas las pantallas
export function CartSidebarMobileFix() {
  const { isOpen } = useCartSidebar();
  
  useEffect(() => {
    // Esta función se ejecuta cuando cambia el estado de isOpen
    if (isOpen) {
      // Asegurar que el sidebar es visible en dispositivos móviles
      const cartSidebar = document.querySelector('[data-side="right"]') as HTMLElement;
      if (cartSidebar) {
        // Forzar estilos para visibilidad en móviles
        cartSidebar.style.display = 'block';
        cartSidebar.style.visibility = 'visible';
        cartSidebar.style.opacity = '1';
        cartSidebar.style.transform = 'translateX(0)';
        cartSidebar.style.width = window.innerWidth <= 640 ? '100%' : '';
        cartSidebar.style.zIndex = '9999';
        
        // Asegurar que el overlay está visible
        document.documentElement.dataset.sidebarRightOpen = 'true';
      }
    }
  }, [isOpen]);

  return null;
}

import { create } from 'zustand'

type CartSidebarState = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useCartSidebar = create<CartSidebarState>((set, get) => ({
  isOpen: false,
  open: () => {
    set({ isOpen: true })
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-sidebar-right-open', 'true')
    }
  },
  close: () => {
    set({ isOpen: false })
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-sidebar-right-open', 'false')
    }
  },
  toggle: () => {
    const currentState = get().isOpen
    set({ isOpen: !currentState })
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-sidebar-right-open', !currentState ? 'true' : 'false')
    }
  }
}))

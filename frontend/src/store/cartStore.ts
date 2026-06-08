import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/features/carrito/types/carrito.types";
import type { Producto } from "@/features/catalogo/types/catalogo.types";
import { toast } from "sonner";
import { useAuthStore } from "./authStore";

interface CartState {
  carts: Record<string, CartItem[]>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (producto: Producto, cantidad: number, personalizacion: number[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, cantidad: number) => void;
  clearCart: () => void;
}

const generateCartItemId = (productoId: number, personalizacion: number[]): string => {
  const sortedIds = [...personalizacion].sort((a, b) => a - b);
  return `${productoId}_${sortedIds.join("-")}`;
};

const getCurrentCartKey = (): string => {
  const user = useAuthStore.getState().user;
  return user ? `user_${user.id}` : "guest";
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Diccionario que guarda carritos separados por usuario
      carts: {},
      isOpen: false,
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      addItem: (producto, cantidad, personalizacion) => {
        const key = getCurrentCartKey();
        const currentItems = get().carts[key] || [];
        const itemId = generateCartItemId(producto.id, personalizacion);
        
        let newItems = [...currentItems];
        const existingIndex = currentItems.findIndex((item) => item.id === itemId);
        
        if (existingIndex > -1) {
          const existingItem = currentItems[existingIndex];
          const nuevaCantidad = existingItem.cantidad + cantidad;
          const stockMaximo = producto.stock_cantidad ?? 999;
          
          if (nuevaCantidad > stockMaximo) {
            toast.warning(`Límite de stock alcanzado. Máximo disponible: ${stockMaximo}`, {
              id: `stock-limit-${producto.id}`,
            });
            newItems[existingIndex] = { ...existingItem, cantidad: stockMaximo };
          } else {
            toast.success(`Se agregaron ${cantidad} unidades más al carrito.`);
            newItems[existingIndex] = { ...existingItem, cantidad: nuevaCantidad };
          }
        } else {
          const stockMaximo = producto.stock_cantidad ?? 999;
          const cantidadAAgregar = Math.min(cantidad, stockMaximo);
          
          if (cantidad > stockMaximo) {
            toast.warning(`Cantidad limitada al stock disponible de ${stockMaximo} unidades.`);
          } else {
            toast.success(`${producto.nombre} agregado al carrito.`);
          }
          
          newItems.push({
            id: itemId,
            producto,
            cantidad: cantidadAAgregar,
            personalizacion,
          });
        }
        
        set((state) => ({
          carts: { ...state.carts, [key]: newItems },
          isOpen: true,
        }));
      },
      
      removeItem: (itemId) => {
        const key = getCurrentCartKey();
        const currentItems = get().carts[key] || [];
        const itemToDelete = currentItems.find((item) => item.id === itemId);
        
        if (itemToDelete) {
          toast.info(`${itemToDelete.producto.nombre} eliminado del carrito.`);
        }
        
        const newItems = currentItems.filter((item) => item.id !== itemId);
        set((state) => ({
          carts: { ...state.carts, [key]: newItems },
        }));
      },
      
      updateQuantity: (itemId, cantidad) => {
        const key = getCurrentCartKey();
        const currentItems = get().carts[key] || [];
        const existingItem = currentItems.find((item) => item.id === itemId);
        
        if (!existingItem) return;
        
        const stockMaximo = existingItem.producto.stock_cantidad ?? 999;
        let nuevaCantidad = Math.max(1, cantidad);
        
        if (nuevaCantidad > stockMaximo) {
          toast.warning(`Stock límite de ${stockMaximo} alcanzado.`, {
            id: `stock-limit-update-${existingItem.producto.id}`,
          });
          nuevaCantidad = stockMaximo;
        }
        
        const newItems = currentItems.map((item) =>
          item.id === itemId ? { ...item, cantidad: nuevaCantidad } : item
        );
        
        set((state) => ({
          carts: { ...state.carts, [key]: newItems },
        }));
      },
      
      clearCart: () => {
        const key = getCurrentCartKey();
        set((state) => ({
          carts: { ...state.carts, [key]: [] },
        }));
        toast.info("Carrito vaciado.");
      },
    }),
    {
      name: "the_food_store_cart_zustand",
    }
  )
);

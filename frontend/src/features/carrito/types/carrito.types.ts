import { Producto } from "@/features/catalogo/types/catalogo.types";

export interface CartItem {
  id: string; // Hash único: ${producto_id}_${sorted_personalizacion_ids.join("-")}
  producto: Producto;
  cantidad: number;
  personalizacion: number[]; // Array de IDs de ingredientes excluidos
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrecio: number;
}

export interface CartContextProps extends CartState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (producto: Producto, cantidad: number, personalizacion: number[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, cantidad: number) => void;
  clearCart: () => void;
}

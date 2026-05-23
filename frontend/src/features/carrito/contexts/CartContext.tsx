import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { CartItem, CartContextProps } from "../types/carrito.types";
import { Producto } from "@/features/catalogo/types/catalogo.types";
import { useAuth } from "@/hooks/useAuth";

const CartContext = createContext<CartContextProps | undefined>(undefined);

const generateCartItemId = (productoId: number, personalizacion: number[]): string => {
  const sortedIds = [...personalizacion].sort((a, b) => a - b);
  return `${productoId}_${sortedIds.join("-")}`;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentKey = user ? `the_food_store_cart_${user.id}` : "the_food_store_cart_guest";

  const [activeKey, setActiveKey] = useState(currentKey);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(currentKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error al cargar el carrito de localStorage:", error);
      return [];
    }
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrecio, setTotalPrecio] = useState(0);

  // Sincronizar carrito cuando cambia el usuario (login/logout)
  useEffect(() => {
    if (activeKey !== currentKey) {
      try {
        const stored = localStorage.getItem(currentKey);
        setItems(stored ? JSON.parse(stored) : []);
        setActiveKey(currentKey);
        
        // Si el usuario se desloguea, mostramos mensaje de limpieza/cambio
        if (!user) {
          toast.info("Sesión cerrada. Cargando carrito de invitado.");
        }
      } catch (error) {
        console.error("Error al cambiar de carrito en localStorage:", error);
      }
    }
  }, [currentKey, activeKey, user]);

  // Recalcular totales e interactuar con localStorage en cada cambio de items
  useEffect(() => {
    if (activeKey === currentKey) {
      try {
        localStorage.setItem(currentKey, JSON.stringify(items));
      } catch (error) {
        console.error("Error al guardar el carrito en localStorage:", error);
      }
    }

    const calculatedTotalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
    const calculatedTotalPrecio = items.reduce(
      (acc, item) => acc + item.cantidad * item.producto.precio_base,
      0
    );

    setTotalItems(calculatedTotalItems);
    setTotalPrecio(calculatedTotalPrecio);
  }, [items, currentKey, activeKey]);

  const addItem = (
    producto: Producto,
    cantidad: number,
    personalizacion: number[]
  ) => {
    const itemId = generateCartItemId(producto.id, personalizacion);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);

      if (existingIndex > -1) {
        const existingItem = prevItems[existingIndex];
        const nuevaCantidad = existingItem.cantidad + cantidad;
        const stockMaximo = producto.stock_cantidad ?? 999;

        if (nuevaCantidad > stockMaximo) {
          toast.warning(`Límite de stock alcanzado. Máximo disponible: ${stockMaximo}`, {
            id: `stock-limit-${producto.id}`,
          });
          
          const updatedItems = [...prevItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            cantidad: stockMaximo,
          };
          return updatedItems;
        }

        toast.success(`Se agregaron ${cantidad} unidades más al carrito.`);
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = {
          ...existingItem,
          cantidad: nuevaCantidad,
        };
        return updatedItems;
      }

      const stockMaximo = producto.stock_cantidad ?? 999;
      const cantidadAAgregar = Math.min(cantidad, stockMaximo);

      if (cantidad > stockMaximo) {
        toast.warning(`Cantidad limitada al stock disponible de ${stockMaximo} unidades.`);
      } else {
        toast.success(`${producto.nombre} agregado al carrito.`);
      }

      return [
        ...prevItems,
        {
          id: itemId,
          producto,
          cantidad: cantidadAAgregar,
          personalizacion,
        },
      ];
    });

    // Abrir automáticamente el Drawer lateral para retroalimentación excelente de UX
    setIsOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prevItems) => {
      const itemToDelete = prevItems.find((item) => item.id === itemId);
      if (itemToDelete) {
        toast.info(`${itemToDelete.producto.nombre} eliminado del carrito.`);
      }
      return prevItems.filter((item) => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId: string, cantidad: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemId);
      if (!existingItem) return prevItems;

      const stockMaximo = existingItem.producto.stock_cantidad ?? 999;
      let nuevaCantidad = Math.max(1, cantidad);

      if (nuevaCantidad > stockMaximo) {
        toast.warning(`Stock límite de ${stockMaximo} alcanzado.`, {
          id: `stock-limit-update-${existingItem.producto.id}`,
        });
        nuevaCantidad = stockMaximo;
      }

      return prevItems.map((item) =>
        item.id === itemId ? { ...item, cantidad: nuevaCantidad } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    toast.info("Carrito vaciado.");
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrecio,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext debe usarse dentro de un CartProvider");
  }
  return context;
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Producto, ProductoFormData } from "../types/producto.types";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  reactivarProducto,
  toggleAvailability,
} from "../services/productosService";

export const useProductosQuery = () => {
  return useQuery<Producto[]>({
    queryKey: ["productos"],
    queryFn: () => getProductos(0, 500, undefined, true),
  });
};

export const useProductoCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Producto, Error, ProductoFormData>({
    mutationFn: createProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
};

export const useProductoUpdateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Producto | null, Error, { id: number; data: ProductoFormData }>({
    mutationFn: ({ id, data }) => updateProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
};

export const useProductoDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, number>({
    mutationFn: deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
};

export const useProductoReactivateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Producto | null, Error, number>({
    mutationFn: reactivarProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
};

export const useProductoToggleAvailabilityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Producto | null, Error, { id: number; disponible: boolean }>({
    mutationFn: ({ id, disponible }) => toggleAvailability(id, disponible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
};

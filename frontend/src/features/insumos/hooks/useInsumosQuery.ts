import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Ingrediente, IngredienteFormData, UnidadMedida } from "../types/insumo.types";
import {
  getInsumos,
  getUnidadesMedida,
  createInsumo,
  updateInsumo,
  bajaLogicaInsumo,
  toggleActiveInsumo,
} from "../services/insumosService";

interface IngredienteListResponse {
  items: Ingrediente[];
  total: number;
  skip: number;
  limit: number;
}

/** Hook de TanStack Query para listar insumos */
export const useInsumosQuery = (
  skip = 0,
  limit = 20,
  search = "",
  soloAlergenos = false,
  mostrarInactivos = false
) => {
  return useQuery<IngredienteListResponse>({
    queryKey: ["insumos", skip, limit, search, soloAlergenos, mostrarInactivos],
    queryFn: () => getInsumos(skip, limit, search, soloAlergenos, mostrarInactivos),
  });
};

/** Hook de TanStack Query para listar unidades de medida */
export const useUnidadesMedidaQuery = () => {
  return useQuery<UnidadMedida[]>({
    queryKey: ["unidades_medida"],
    queryFn: getUnidadesMedida,
  });
};

/** Hook de TanStack Query para crear un insumo con invalidación de caché reactiva */
export const useInsumoCreateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Ingrediente, Error, IngredienteFormData>({
    mutationFn: createInsumo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
  });
};

/** Hook de TanStack Query para actualizar un insumo con invalidación de caché reactiva */
export const useInsumoUpdateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Ingrediente | null, Error, { id: number; data: IngredienteFormData }>({
    mutationFn: ({ id, data }) => updateInsumo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      // Notificar a otras pestañas (ej: /menu) que los precios cambiaron.
      // BroadcastChannel funciona entre tabs del mismo origen sin necesidad de auth.
      try {
        const ch = new BroadcastChannel("tfs-catalogo");
        ch.postMessage({ event: "PRODUCTO_ACTUALIZADO" });
        ch.close();
      } catch {
        // BroadcastChannel no soportado en este entorno — se ignora silenciosamente.
      }
    },
  });
};

/** Hook de TanStack Query para eliminar un insumo con invalidación de caché reactiva */
export const useInsumoDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, number>({
    mutationFn: bajaLogicaInsumo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
  });
};

/** Hook de TanStack Query para alternar estado activo/inactivo con invalidación de caché reactiva */
export const useInsumoToggleActiveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Ingrediente | null, Error, number>({
    mutationFn: toggleActiveInsumo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
  });
};

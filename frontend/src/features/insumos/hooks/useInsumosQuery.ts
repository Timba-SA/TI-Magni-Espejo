import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/shared/api/axiosClient";
import type { Ingrediente, IngredienteFormData, UnidadMedida } from "../types/insumo.types";

interface IngredienteListResponse {
  items: Ingrediente[];
  total: number;
  skip: number;
  limit: number;
}

/** Hook de TanStack Query para listar insumos (ingredientes) consumiendo la API de forma segura con Axios */
export const useInsumosQuery = (
  skip = 0,
  limit = 20,
  search = "",
  soloAlergenos = false,
  mostrarInactivos = false
) => {
  return useQuery<IngredienteListResponse>({
    queryKey: ["insumos", skip, limit, search, soloAlergenos, mostrarInactivos],
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("nombre", search);
      if (soloAlergenos) params.append("es_alergeno", "true");
      if (mostrarInactivos) params.append("incluir_inactivos", "true");

      const response = await axiosClient.get<IngredienteListResponse>(`/ingredientes?${params.toString()}`);
      return response.data;
    },
  });
};

/** Hook de TanStack Query para listar unidades de medida */
export const useUnidadesMedidaQuery = () => {
  return useQuery<UnidadMedida[]>({
    queryKey: ["unidades_medida"],
    queryFn: async () => {
      const response = await axiosClient.get<UnidadMedida[]>("/unidades-medida/");
      return response.data;
    },
  });
};

/** Hook de TanStack Query para crear un insumo (mutación) con invalidación de caché reactiva */
export const useInsumoCreateMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Ingrediente, Error, IngredienteFormData>({
    mutationFn: async (data) => {
      const response = await axiosClient.post<Ingrediente>("/ingredientes", {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        es_alergeno: data.es_alergeno,
        unidad_medida_id: data.unidad_medida_id,
        stock_actual: Number(data.stock_actual) || 0,
        stock_minimo: Number(data.stock_minimo) || 0,
        costo_unitario: Number(data.costo_unitario) || 0,
        peso: data.peso !== null && data.peso !== undefined ? Number(data.peso) : null,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalida la caché del listado de insumos para refrescar automáticamente la grilla
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
  });
};

/** Hook de TanStack Query para actualizar un insumo (mutación) con invalidación de caché reactiva */
export const useInsumoUpdateMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Ingrediente, Error, { id: number; data: IngredienteFormData }>({
    mutationFn: async ({ id, data }) => {
      const response = await axiosClient.patch<Ingrediente>(`/ingredientes/${id}`, {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        es_alergeno: data.es_alergeno,
        unidad_medida_id: data.unidad_medida_id,
        stock_actual: Number(data.stock_actual) !== undefined ? Number(data.stock_actual) : undefined,
        stock_minimo: Number(data.stock_minimo) !== undefined ? Number(data.stock_minimo) : undefined,
        costo_unitario: Number(data.costo_unitario) !== undefined ? Number(data.costo_unitario) : undefined,
        peso: data.peso !== null && data.peso !== undefined ? Number(data.peso) : null,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
  });
};

/** Hook de TanStack Query para eliminar un insumo (mutación) con invalidación de caché reactiva */
export const useInsumoDeleteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, number>({
    mutationFn: async (id) => {
      await axiosClient.delete(`/ingredientes/${id}`);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
  });
};

/** Hook de TanStack Query para alternar estado activo/inactivo (mutación) con invalidación de caché reactiva */
export const useInsumoToggleActiveMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Ingrediente, Error, number>({
    mutationFn: async (id) => {
      const response = await axiosClient.patch<Ingrediente>(`/ingredientes/${id}/toggle-active`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insumos"] });
    },
  });
};

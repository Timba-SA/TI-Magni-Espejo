import { useState, useEffect } from "react";
import { 
  ClipboardList, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ChevronRight,
  Clock, 
  User, 
  MapPin, 
  CreditCard, 
  FileText,
  Loader2, 
  Check
} from "lucide-react";
import { 
  listarPedidosGestion, 
  obtenerPedido, 
  avanzarEstadoPedido, 
  PedidoDetailResponse 
} from "@/features/pedidos/services/pedidosAdminService";
import { getInsumos } from "@/features/insumos/services/insumosService";
import type { PedidoResponse } from "@/features/checkout/types/checkout.types";
import { BackToDashboard } from "@/components/admin/BackToDashboard";
import { toast } from "sonner";
import { useOrderStatusWS } from "@/hooks/useOrderStatusWS";

// Label para sección
function SectionLabel({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span
        className="text-[8px] tracking-[0.5em] uppercase flex-shrink-0"
        style={{ color: "rgba(255,90,0,0.55)", fontFamily: "'Space Mono', monospace" }}
      >
        {code} — {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--tfs-divider)" }} />
    </div>
  );
}

// Estilos del badge de estado
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDIENTE":
      return {
        text: "Pendiente",
        bg: "rgba(255,90,0,0.1)",
        border: "1px solid rgba(255,90,0,0.3)",
        color: "#FF5A00",
        dot: "bg-orange-500 animate-pulse"
      };
    case "CONFIRMADO":
      return {
        text: "Confirmado",
        bg: "rgba(33,150,243,0.1)",
        border: "1px solid rgba(33,150,243,0.3)",
        color: "#2196F3",
        dot: "bg-blue-500"
      };
    case "EN_PREP":
      return {
        text: "En Cocina",
        bg: "rgba(156,39,176,0.1)",
        border: "1px solid rgba(156,39,176,0.3)",
        color: "#9C27B0",
        dot: "bg-purple-500 animate-pulse"
      };
    case "ENTREGADO":
      return {
        text: "Entregado",
        bg: "rgba(76,175,80,0.1)",
        border: "1px solid rgba(76,175,80,0.3)",
        color: "#4CAF50",
        dot: "bg-green-500"
      };
    case "CANCELADO":
      return {
        text: "Cancelado",
        bg: "rgba(244,67,54,0.1)",
        border: "1px solid rgba(244,67,54,0.3)",
        color: "#F44336",
        dot: "bg-red-500"
      };
    default:
      return {
        text: status,
        bg: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "var(--tfs-text-heading)",
        dot: "bg-neutral-500"
      };
  }
};

export function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<PedidoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Detalle del pedido seleccionado
  const [selectedPedido, setSelectedPedido] = useState<PedidoDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Diccionario de ingredientes para resolver personalizaciones (IDs a nombres)
  const [ingredientsMap, setIngredientsMap] = useState<Record<number, string>>({});

  // Filtro de estados
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [pendingCancelId, setPendingCancelId] = useState<number | null>(null);
  const [devolverStock, setDevolverStock] = useState(true);

  // Cargando acción
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const data = await listarPedidosGestion();
      setPedidos(data);
    } catch (err: any) {
      toast.error("Error al consultar el listado de pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await getInsumos(0, 300, "", false, true);
      const mapping: Record<number, string> = {};
      response.items.forEach((item) => {
        mapping[item.id] = item.nombre;
      });
      setIngredientsMap(mapping);
    } catch (err) {
      console.error("Error cargando ingredientes para el mapeo:", err);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchIngredients();
  }, []);

  // Escuchar notificaciones en tiempo real para todos los pedidos (admin/personal)
  useOrderStatusWS({
    onEvent: (event) => {
      fetchPedidos();
      if (selectedPedido) {
        obtenerPedido(selectedPedido.id)
          .then(setSelectedPedido)
          .catch(() => {});
      }
      if (event.event === "ORDER_STATE_CHANGED") {
        toast.info(`Pedido #${event.pedido_id.toString().padStart(4, "0")} cambió a estado ${event.estado_codigo}`);
      }
    }
  });

  const handleSelectPedido = async (id: number) => {
    try {
      setLoadingDetail(true);
      const detail = await obtenerPedido(id);
      setSelectedPedido(detail);
    } catch (err) {
      toast.error("No se pudo obtener el detalle del pedido.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAdvanceStatus = async (pedidoId: number, nextStatus: string, motivo?: string, devolverStockValue?: boolean) => {
    try {
      setActionLoading(true);
      await avanzarEstadoPedido(pedidoId, nextStatus, motivo, devolverStockValue);
      toast.success(`Pedido #${pedidoId} actualizado a ${nextStatus}`);
      
      // Actualizar listado local
      await fetchPedidos();
      
      // Actualizar detalle si estaba abierto
      if (selectedPedido && selectedPedido.id === pedidoId) {
        const updatedDetail = await obtenerPedido(pedidoId);
        setSelectedPedido(updatedDetail);
      }
    } catch (err: any) {
      const errMsg = err.message || "Error al cambiar el estado del pedido.";
      toast.error(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelModal = (pedidoId: number) => {
    setPendingCancelId(pedidoId);
    setCancellationReason("");
    setDevolverStock(true);
    setCancelModalOpen(true);
  };

  const confirmCancellation = async () => {
    if (!cancellationReason.trim()) {
      toast.warning("El motivo de cancelación es absolutamente obligatorio.");
      return;
    }
    if (pendingCancelId === null) return;

    setCancelModalOpen(false);
    await handleAdvanceStatus(pendingCancelId, "CANCELADO", cancellationReason.trim(), devolverStock);
    setPendingCancelId(null);
  };

  // Filtrado de pedidos
  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesStatus = statusFilter === "TODOS" || pedido.estado_codigo === statusFilter;
    const matchesSearch = 
      String(pedido.id).includes(searchQuery) || 
      String(pedido.usuario_id).includes(searchQuery) ||
      (pedido.notas && pedido.notas.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS"
    }).format(value);
  };

  // Contadores para tarjetas informativas
  const getCounts = (status: string) => {
    return pedidos.filter(p => p.estado_codigo === status).length;
  };

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-7xl mx-auto text-white">
      <BackToDashboard />

      {/* Cabecera */}
      <div>
        <div className="flex items-center gap-2 mb-3 animate-fade-in" style={{ fontFamily: "'Space Mono', monospace" }}>
          <ClipboardList size={11} style={{ color: "rgba(255,90,0,0.5)" }} />
          <span className="text-[9px] tracking-[0.45em] uppercase text-neutral-400">
            Módulo de Administración
          </span>
        </div>
        <h2
          className="leading-none mb-2"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 300, letterSpacing: "-0.02em" }}
        >
          Gestión de <span className="font-semibold text-orange-500">Pedidos</span>
        </h2>
        <p className="text-xs text-neutral-400 font-mono tracking-wider">
          Monitoreá en tiempo real, confirmá cocina y gestioná el despacho logístico del local.
        </p>
        <div className="mt-5 h-[1px] bg-gradient-to-right from-orange-500/40 via-orange-500/5 to-transparent" />
      </div>

      {/* Tarjetas informativas del FSM */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Pendientes", code: "PENDIENTE", color: "border-orange-500/30 text-orange-500" },
          { label: "Confirmados", code: "CONFIRMADO", color: "border-blue-500/30 text-blue-500" },
          { label: "En Cocina", code: "EN_PREP", color: "border-purple-500/30 text-purple-500" },
          { label: "Entregados", code: "ENTREGADO", color: "border-green-500/30 text-green-500" },
          { label: "Cancelados", code: "CANCELADO", color: "border-red-500/30 text-red-500" }
        ].map((card) => (
          <button
            key={card.code}
            onClick={() => setStatusFilter(card.code)}
            className={`p-4 bg-[#0E0E0E] hover:bg-[#141414] border ${card.color} rounded-2xl transition-all duration-200 text-left flex flex-col justify-between h-24 group relative overflow-hidden`}
          >
            <span className="text-[10px] uppercase font-mono tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
              {card.label}
            </span>
            <span className="text-2xl font-black font-mono leading-none mt-2">
              {getCounts(card.code)}
            </span>
            {statusFilter === card.code && (
              <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-current" />
            )}
          </button>
        ))}
      </div>

      {/* Filtros e Inputs */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["TODOS", "PENDIENTE", "CONFIRMADO", "EN_PREP", "ENTREGADO", "CANCELADO"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/10"
                  : "bg-white/[0.02] border-white/5 text-neutral-400 hover:border-white/10 hover:text-white"
              }`}
            >
              {st === "TODOS" ? "Todos" : getStatusBadge(st).text}
            </button>
          ))}
        </div>

        {/* Input búsqueda */}
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID, Notas, Cliente..."
            className="w-full text-xs pl-10 pr-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] focus:bg-neutral-900 border border-white/5 focus:border-orange-500/40 rounded-xl outline-none transition-all placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Contenido en Grilla: Tabla/Lista izquierda y Vista Detalle derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Columna Izquierda: Listado de pedidos */}
        <div className="lg:col-span-7 space-y-3">
          <SectionLabel label={`Pedidos Filtrados (${filteredPedidos.length})`} code="01" />

          {loading ? (
            <div className="text-center py-12 bg-[#0E0E0E]/40 border border-white/5 rounded-3xl backdrop-blur-xl">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
              <p className="text-xs font-mono tracking-widest text-neutral-500">Cargando base de pedidos...</p>
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="text-center py-16 bg-[#0E0E0E]/40 border border-white/5 rounded-3xl backdrop-blur-xl space-y-3">
              <AlertCircle size={32} className="text-neutral-600 mx-auto" />
              <div>
                <p className="text-sm font-bold">No se encontraron pedidos</p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                  Intentá modificando los filtros o el campo de búsqueda arriba.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {filteredPedidos.map((ped) => {
                const badge = getStatusBadge(ped.estado_codigo);
                const isSelected = selectedPedido?.id === ped.id;

                return (
                  <div
                    key={ped.id}
                    onClick={() => handleSelectPedido(ped.id)}
                    className={`p-4 bg-[#0E0E0E]/60 border rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                      isSelected 
                        ? "border-orange-500/50 bg-[#0E0E0E]/90 shadow-2xl shadow-orange-500/5" 
                        : "border-white/5 hover:border-white/10 hover:bg-[#0E0E0E]/80"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black text-neutral-400">
                          #{String(ped.id).padStart(4, "0")}
                        </span>
                        <div 
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: badge.bg, border: badge.border, color: badge.color }}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.text}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <User size={12} /> Cliente: ID {ped.usuario_id}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={12} /> {new Date(ped.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-black font-mono tracking-tight text-white">
                          {formatCurrency(Number(ped.total))}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          {ped.detalles.length} {ped.detalles.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <ChevronRight size={16} className={`text-neutral-600 transition-transform ${isSelected ? "text-orange-500 translate-x-1" : "group-hover:translate-x-1"}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Ficha de pedido interactiva */}
        <div className="lg:col-span-5 space-y-4">
          <SectionLabel label="Ficha de Pedido" code="02" />

          {loadingDetail ? (
            <div className="py-24 bg-[#0E0E0E]/40 border border-white/5 rounded-3xl text-center backdrop-blur-xl">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
              <p className="text-xs font-mono text-neutral-500">Recuperando detalles de auditoría...</p>
            </div>
          ) : !selectedPedido ? (
            <div className="py-24 bg-[#0E0E0E]/20 border border-dashed border-white/5 rounded-3xl text-center p-6 space-y-3">
              <AlertCircle size={28} className="text-neutral-700 mx-auto" />
              <div>
                <p className="text-xs font-bold text-neutral-400">Ningún pedido seleccionado</p>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto mt-1">
                  Hacé click en cualquier pedido del listado izquierdo para ver la ficha detallada de auditoría y transiciones FSM.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#0E0E0E]/80 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
              <div className="absolute -inset-4 bg-orange-500/5 rounded-[40px] blur-2xl pointer-events-none" />
              
              {/* Encabezado Ficha */}
              <div className="relative flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black font-mono tracking-wide">
                    PEDIDO #{String(selectedPedido.id).padStart(4, "0")}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    {new Date(selectedPedido.created_at).toLocaleString()}
                  </p>
                </div>
                <div 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ 
                    background: getStatusBadge(selectedPedido.estado_codigo).bg, 
                    border: getStatusBadge(selectedPedido.estado_codigo).border, 
                    color: getStatusBadge(selectedPedido.estado_codigo).color 
                  }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(selectedPedido.estado_codigo).dot}`} />
                  {getStatusBadge(selectedPedido.estado_codigo).text.toUpperCase()}
                </div>
              </div>

              {/* Botones de acción FSM */}
              <div className="relative p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                  Acciones de Transición FSM
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {selectedPedido.estado_codigo === "PENDIENTE" && (
                    <>
                      <button
                        onClick={() => handleAdvanceStatus(selectedPedido.id, "CONFIRMADO")}
                        disabled={actionLoading}
                        className="flex-1 min-w-[120px] py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Check size={14} /> Confirmar Cocina
                      </button>
                      <button
                        onClick={() => openCancelModal(selectedPedido.id)}
                        disabled={actionLoading}
                        className="py-2 px-3 bg-red-950/40 border border-red-900/30 hover:bg-red-900/20 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <XCircle size={14} /> Cancelar
                      </button>
                    </>
                  )}

                  {selectedPedido.estado_codigo === "CONFIRMADO" && (
                    <>
                      <button
                        onClick={() => handleAdvanceStatus(selectedPedido.id, "EN_PREP")}
                        disabled={actionLoading}
                        className="flex-1 min-w-[120px] py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Clock size={14} /> Iniciar Preparación
                      </button>
                      <button
                        onClick={() => openCancelModal(selectedPedido.id)}
                        disabled={actionLoading}
                        className="py-2 px-3 bg-red-950/40 border border-red-900/30 hover:bg-red-900/20 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <XCircle size={14} /> Cancelar
                      </button>
                    </>
                  )}

                  {selectedPedido.estado_codigo === "EN_PREP" && (
                    <>
                      <button
                        onClick={() => handleAdvanceStatus(selectedPedido.id, "ENTREGADO")}
                        disabled={actionLoading}
                        className="flex-1 min-w-[120px] py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Truck size={14} /> Marcar como Entregado
                      </button>
                      <button
                        onClick={() => openCancelModal(selectedPedido.id)}
                        disabled={actionLoading}
                        className="py-2 px-3 bg-red-950/40 border border-red-900/30 hover:bg-red-900/20 text-red-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <XCircle size={14} /> Cancelar
                      </button>
                    </>
                  )}

                  {["ENTREGADO", "CANCELADO"].includes(selectedPedido.estado_codigo) && (
                    <div className="w-full py-2 bg-zinc-900 border border-dashed border-zinc-800 text-zinc-500 rounded-xl text-center text-xs font-mono">
                      Estado terminal alcanzado. Sin transiciones.
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles Cliente y Entrega */}
              <div className="relative space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex items-center gap-1">
                      <User size={10} /> Cliente
                    </p>
                    <p className="text-xs font-bold">Usuario ID {selectedPedido.usuario_id}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex items-center gap-1">
                      <CreditCard size={10} /> Pago
                    </p>
                    <p className="text-xs font-bold font-mono text-orange-500">{selectedPedido.forma_pago_codigo}</p>
                  </div>
                </div>

                {selectedPedido.direccion_id && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex items-center gap-1">
                      <MapPin size={10} /> Dirección de Entrega (ID {selectedPedido.direccion_id})
                    </p>
                    <p className="text-xs text-neutral-300">
                      Entregar al domicilio registrado bajo el identificador asignado.
                    </p>
                  </div>
                )}

                {selectedPedido.notas && (
                  <div className="space-y-1.5 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                    <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 flex items-center gap-1">
                      <FileText size={10} /> Notas del local
                    </p>
                    <p className="text-xs text-neutral-300 italic">"{selectedPedido.notas}"</p>
                  </div>
                )}
              </div>

              {/* Items del Pedido */}
              <div className="relative space-y-3">
                <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                  Desglose de Ítems
                </p>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedPedido.detalles.map((det) => {
                    // Procesamos personalización (excluidos)
                    let excluidosNombres: string[] = [];
                    if (det.personalizacion) {
                      try {
                        let ids: number[] = [];
                        if (typeof det.personalizacion === "string") {
                          ids = JSON.parse(det.personalizacion);
                        } else if (Array.isArray(det.personalizacion)) {
                          ids = det.personalizacion;
                        }
                        excluidosNombres = ids
                          .map((id) => ingredientsMap[id] || `Ingrediente #${id}`)
                          .filter(Boolean);
                      } catch {
                        excluidosNombres = [];
                      }
                    }

                    return (
                      <div key={det.id} className="flex justify-between items-start py-2 border-b border-white/5 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-white">
                            {det.nombre_snapshot} <span className="text-neutral-500 font-normal">x {det.cantidad}</span>
                          </p>
                          {excluidosNombres.length > 0 && (
                            <p className="text-[10px] text-red-400 font-mono">
                              ✕ Sin: {excluidosNombres.join(", ")}
                            </p>
                          )}
                        </div>
                        <p className="font-mono text-neutral-300">
                          {formatCurrency(Number(det.subtotal_snap))}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 font-mono">
                  <span className="text-xs text-neutral-500">TOTAL</span>
                  <span className="text-base font-black text-orange-500">
                    {formatCurrency(Number(selectedPedido.total))}
                  </span>
                </div>
              </div>

              {/* Historial de transiciones cronológico */}
              <div className="relative space-y-3">
                <p className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                  Auditoría de Transiciones (Historial FSM)
                </p>
                
                <div className="space-y-3 pl-3 border-l border-white/5">
                  {selectedPedido.historial.map((hist) => (
                    <div key={hist.id} className="relative text-[11px] space-y-1">
                      <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-neutral-800 border-2 border-orange-500" />
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-neutral-500">
                          {new Date(hist.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="font-bold">
                          {hist.estado_desde ? getStatusBadge(hist.estado_desde).text : "Creación"}
                        </span>
                        <span className="text-neutral-600">→</span>
                        <span className="font-bold text-orange-400">
                          {getStatusBadge(hist.estado_hacia).text}
                        </span>
                      </div>

                      {hist.motivo && (
                        <p className="text-[10px] text-neutral-400 italic bg-white/[0.01] px-2 py-1 rounded border border-white/5">
                          "{hist.motivo}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* MODAL para cancelar pedido obligatoriamente con motivo */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full bg-[#0E0E0E] border border-red-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <XCircle size={24} />
              <h3 className="text-lg font-bold">Cancelar Pedido</h3>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed">
              Estás a punto de cancelar el pedido. De acuerdo a las políticas del local, esta operación devolverá el stock a los insumos y requiere obligatoriamente registrar un motivo formal.
            </p>

            {/* Checkbox para reintegrar insumos */}
            <div 
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.01] border border-white/5 transition-all hover:bg-white/[0.03] select-none cursor-pointer" 
              onClick={() => setDevolverStock(!devolverStock)}
            >
              <input
                type="checkbox"
                id="devolver-stock-chk"
                checked={devolverStock}
                onChange={(e) => setDevolverStock(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded border-zinc-700 text-orange-500 focus:ring-orange-500/50 cursor-pointer"
              />
              <label htmlFor="devolver-stock-chk" className="text-xs cursor-pointer text-neutral-300">
                Reintegrar insumos consumidos al inventario
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                Motivo de Cancelación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Ej: Cliente cancela llamada telefónica, falta de stock de insumo secundario, etc."
                rows={3}
                className="w-full text-xs px-4 py-3 bg-white/[0.02] border border-white/5 focus:border-red-500/50 rounded-xl outline-none text-white transition-all placeholder:text-neutral-700 resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 text-xs">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-neutral-900 border border-white/5 hover:border-white/10 rounded-xl text-neutral-400 hover:text-white cursor-pointer transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={confirmCancellation}
                disabled={!cancellationReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-all"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-white/5">
        <p className="text-[9px] text-center tracking-[0.4em] uppercase text-neutral-500 font-mono">
          The Food Store · Módulo Logístico · 2026
        </p>
      </div>
    </div>
  );
}

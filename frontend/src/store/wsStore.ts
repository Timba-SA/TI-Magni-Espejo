import { create } from "zustand";

interface WSState {
  status: "CONNECTED" | "CONNECTING" | "DISCONNECTED";
  setStatus: (status: "CONNECTED" | "CONNECTING" | "DISCONNECTED") => void;
}

export const useWSStore = create<WSState>((set) => ({
  status: "DISCONNECTED",
  setStatus: (status) => set({ status }),
}));

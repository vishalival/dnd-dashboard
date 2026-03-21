import { create } from "zustand";

interface CampaignState {
  campaignId: string | null;
  campaignName: string | null;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  searchQuery: string;
  activeView: string;
  setCampaignId: (id: string) => void;
  setCampaignName: (name: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setSearchQuery: (query: string) => void;
  setActiveView: (view: string) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaignId: null,
  campaignName: null,
  sidebarOpen: true,
  commandPaletteOpen: false,
  searchQuery: "",
  activeView: "dashboard",
  setCampaignId: (id) => set({ campaignId: id }),
  setCampaignName: (name) => set({ campaignName: name }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveView: (view) => set({ activeView: view }),
}));

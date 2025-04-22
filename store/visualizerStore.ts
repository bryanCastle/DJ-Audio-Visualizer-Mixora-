import { create } from 'zustand'
import { WLEDService } from '../services/wledService'

interface BackgroundState {
  type: 'color' | 'hdri';
  color?: string;
  path?: string;
}

interface VisualizerState {
  color: string
  effect: 'bars' | 'wave' | 'particles' | 'sphere' | 'rings'
  wledEnabled: boolean
  wledDeviceIp: string
  wledService: WLEDService | null
  activeEffects: string[]
  background: BackgroundState
  showFPS: boolean
  setColor: (color: string) => void
  setEffect: (effect: 'bars' | 'wave' | 'particles' | 'sphere' | 'rings') => void
  setWledEnabled: (enabled: boolean) => void
  setWledDeviceIp: (ip: string) => void
  initializeWled: () => void
  setActiveEffects: (effects: string[]) => void
  setBackground: (background: BackgroundState) => void
  setShowFPS: (show: boolean) => void
}

export const useStore = create<VisualizerState>((set, get) => ({
  color: '#ff0000',
  effect: 'bars',
  wledEnabled: false,
  wledDeviceIp: '',
  wledService: null,
  activeEffects: ['bars', 'titleSong'],
  background: { type: 'color', color: '#000000' },
  showFPS: false,
  setColor: (color) => {
    console.log('[Store] Setting color:', color);
    const { wledEnabled, wledService } = get();
    console.log('[Store] WLED status:', { wledEnabled, hasService: !!wledService });
    
    // Update the color in the store
    set({ color });
    
    // If WLED is enabled and service exists, update the WLED device
    if (wledEnabled && wledService) {
      console.log('[Store] Updating WLED with new color');
      wledService.setColor(color).catch(error => {
        console.error('[Store] Error updating WLED:', error);
      });
    }
  },
  setEffect: (effect) => set({ effect }),
  setWledEnabled: (enabled) => {
    console.log('[Store] Setting WLED enabled:', enabled);
    set({ wledEnabled: enabled });
  },
  setWledDeviceIp: (ip) => {
    console.log('[Store] Setting WLED IP:', ip);
    set({ wledDeviceIp: ip });
  },
  initializeWled: () => {
    const { wledDeviceIp } = get();
    console.log('[Store] Initializing WLED with IP:', wledDeviceIp);
    if (wledDeviceIp) {
      const service = new WLEDService(wledDeviceIp);
      set({ wledService: service });
      
      // Test the connection by getting the current state
      service.getState().then(state => {
        console.log('[Store] WLED connection test successful:', state);
      }).catch(error => {
        console.error('[Store] WLED connection test failed:', error);
      });
    }
  },
  setActiveEffects: (effects) => set({ activeEffects: effects }),
  setBackground: (background: BackgroundState) => set({ background }),
  setShowFPS: (show) => set({ showFPS: show })
})) 
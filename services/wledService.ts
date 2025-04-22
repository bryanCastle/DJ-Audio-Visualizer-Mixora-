import axios from 'axios';

export class WLEDService {
  private baseUrl: string;
  private lastRequestTime: number = 0;
  private requestDebounceTime: number = 100; // 100ms debounce
  private stateCache: any = null;
  private cacheTimeout: number = 5000; // 5 seconds cache
  private activeRequests: Set<AbortController> = new Set();
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(deviceIp: string) {
    this.baseUrl = `http://${deviceIp}/json`;
    console.log('[WLED] Initializing service with IP:', deviceIp);
  }

  // Add cleanup method
  public cleanup() {
    // Abort all active requests
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
    // Clear cache
    this.stateCache = null;
  }

  private async debouncedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    if (now - this.lastRequestTime < this.requestDebounceTime) {
      await new Promise(resolve => setTimeout(resolve, this.requestDebounceTime));
    }
    this.lastRequestTime = Date.now();
    return requestFn();
  }

  private async retryRequest<T>(requestFn: () => Promise<T>, retryCount = 0): Promise<T> {
    const controller = new AbortController();
    this.activeRequests.add(controller);

    try {
      const response = await requestFn();
      this.activeRequests.delete(controller);
      return response;
    } catch (error) {
      this.activeRequests.delete(controller);
      
      if (retryCount < this.maxRetries && axios.isAxiosError(error) && !error.response) {
        // Only retry on network errors, not on HTTP errors
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
        return this.retryRequest(requestFn, retryCount + 1);
      }
      throw error;
    }
  }

  async setColor(color: string) {
    try {
      console.log('[WLED] Setting color:', color);
      
      // Validate color format
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        throw new Error('Invalid color format. Expected hex color (e.g., #FF0000)');
      }

      // Convert hex color to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      console.log('[WLED] RGB values:', { r, g, b });

      const payload = {
        on: true,
        seg: [{
          col: [[r, g, b]],
          fx: 0, // Solid color effect
          sx: 128, // Default speed
          ix: 128, // Default intensity
        }]
      };

      return this.debouncedRequest(async () => {
        return this.retryRequest(async () => {
          console.log('[WLED] Sending payload:', payload);
          const response = await axios.post(`${this.baseUrl}/state`, payload);
          console.log('[WLED] Response:', response.data);
          this.stateCache = response.data;
          return response.data;
        });
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[WLED] Network error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('[WLED] Error setting color:', error);
      }
      throw error;
    }
  }

  async getState() {
    try {
      console.log('[WLED] Getting state');
      
      // Return cached state if it's still valid
      if (this.stateCache && Date.now() - this.lastRequestTime < this.cacheTimeout) {
        console.log('[WLED] Returning cached state');
        return this.stateCache;
      }

      return this.debouncedRequest(async () => {
        return this.retryRequest(async () => {
          const response = await axios.get(`${this.baseUrl}/state`);
          console.log('[WLED] Current state:', response.data);
          this.stateCache = response.data;
          return response.data;
        });
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[WLED] Network error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } else {
        console.error('[WLED] Error getting state:', error);
      }
      throw error;
    }
  }
} 
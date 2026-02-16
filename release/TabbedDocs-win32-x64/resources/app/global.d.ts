export {};

declare global {
  interface Window {
    electronAPI?: {
      secureKey: {
        get: () => Promise<string | null>;
        set: (apiKey: string) => Promise<boolean>;
        remove: () => Promise<boolean>;
      };
      ai: {
        generate: (payload: { apiKey: string; prompt: string }) => Promise<string>;
      };
    };
  }
}

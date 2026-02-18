export interface DocumentData {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isActive: boolean;
  lastModified: number;
}

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  savedAt: number;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  docId: string | null;
}

export interface SelectionState {
  text: string;
  rect: DOMRect | null;
}

export interface ModelOption {
  id: string;
  name: string;
  vibe: string;
}

export interface ModelCategory {
  id: string;
  label: string;
  models: ModelOption[];
}

export enum FontType {
  SANS = 'Arial, sans-serif',
  SERIF = 'Times New Roman, serif',
  MONO = 'Courier New, monospace',
}

export enum FontSize {
  SMALL = '3',
  NORMAL = '4',
  LARGE = '5',
  HUGE = '7',
}
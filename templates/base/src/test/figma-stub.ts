// vitest setup: a `figma` global good enough for the main-thread modules.
import { vi } from 'vitest';

const storage = new Map<string, unknown>();

(globalThis as { figma?: unknown }).figma = {
  createRectangle: vi.fn(() => ({ x: 0, y: 0, fills: [] as unknown[] })),
  currentPage: { appendChild: vi.fn(), selection: [] as unknown[] },
  viewport: { scrollAndZoomIntoView: vi.fn() },
  clientStorage: {
    getAsync: vi.fn(async (k: string) => storage.get(k)),
    setAsync: vi.fn(async (k: string, v: unknown) => void storage.set(k, v)),
  },
  ui: { postMessage: vi.fn(), on: vi.fn() },
  showUI: vi.fn(),
  closePlugin: vi.fn(),
};

export interface Settings {
  count: number;
}

const DEFAULTS: Settings = { count: 5 };
const KEY = 'settings';

/** Settings persist per user in figma.clientStorage; unknown or missing keys fall back to DEFAULTS. */
export async function loadSettings(): Promise<Settings> {
  const stored = (await figma.clientStorage.getAsync(KEY)) as Partial<Settings> | undefined;
  return { ...DEFAULTS, ...(stored ?? {}) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await figma.clientStorage.setAsync(KEY, settings);
}

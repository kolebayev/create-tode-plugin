import { describe, expect, it } from 'vitest';
import { loadSettings, saveSettings } from './settings';

describe('settings', () => {
  it('falls back to defaults, then returns what was saved', async () => {
    expect(await loadSettings()).toEqual({ count: 5 });
    await saveSettings({ count: 9 });
    expect(await loadSettings()).toEqual({ count: 9 });
  });
});

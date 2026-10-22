import { tode } from '@tode-sdk/core';
import { onUIMessage, postToUI } from './messaging';
import { createRectangles } from './rectangles';
import { loadSettings, saveSettings } from './settings';

async function main(): Promise<void> {
  figma.showUI(__html__, { width: 320, height: 420, themeColors: true });

  onUIMessage('create-rectangles', async ({ count }) => {
    await createRectangles(count);
    await saveSettings({ count });
    tode.trackActionWithMetric('rectangles_created', count);
    postToUI({ type: 'created', count });
  });

  onUIMessage('close', () => figma.closePlugin());

  const settings = await loadSettings();
  postToUI({ type: 'settings', count: settings.count });

  // tode: events tracked before init() finishes are queued and sent after it.
  if (__TODE_API_KEY__) {
    await tode.init({ apiKey: __TODE_API_KEY__ });
  } else {
    console.info('[tode] TODE_API_KEY is empty, analytics is off. Copy .env.example to .env to turn it on.');
  }
}

void main();

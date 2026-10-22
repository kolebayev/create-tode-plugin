import type { MainToUI, UIToMain } from '../../shared/messages';

/**
 * `npm run preview` opens the UI in a normal browser tab, where there is no main
 * thread. This answers the UI the way src/main/main.ts would, and logs every message.
 * Inside Figma (an iframe) it does nothing. tode stays not-ready here and sends nothing.
 */
export function installMockIfOutsideFigma(): void {
  if (window.parent !== window) return;
  let count = 5;
  const reply = (msg: MainToUI) => window.postMessage({ pluginMessage: msg }, '*');

  window.addEventListener('message', (event: MessageEvent) => {
    const msg = (event.data as { pluginMessage?: UIToMain | { type: string } } | null)?.pluginMessage;
    if (!msg) return;
    console.info('[mock figma] ui → main', msg);
    switch (msg.type) {
      case 'create-rectangles':
        count = (msg as Extract<UIToMain, { type: 'create-rectangles' }>).count;
        setTimeout(() => reply({ type: 'created', count }), 150);
        break;
      case 'close':
        console.info('[mock figma] figma.closePlugin() would run now');
        break;
    }
  });

  setTimeout(() => reply({ type: 'settings', count }), 50);
  console.info('[mock figma] outside Figma: main thread is mocked');
}

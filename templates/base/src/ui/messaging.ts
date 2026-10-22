import type { MainToUI, UIToMain } from '../shared/messages';

export function postToMain(msg: UIToMain): void {
  parent.postMessage({ pluginMessage: msg }, '*');
}

/** Listens for one message type from the main thread. Returns the unsubscribe function. */
export function onMainMessage<T extends MainToUI['type']>(
  type: T,
  handler: (msg: Extract<MainToUI, { type: T }>) => void,
): () => void {
  const listener = (event: MessageEvent) => {
    const msg = (event.data as { pluginMessage?: { type?: unknown } } | null)?.pluginMessage;
    if (msg && msg.type === type) handler(msg as Extract<MainToUI, { type: T }>);
  };
  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}

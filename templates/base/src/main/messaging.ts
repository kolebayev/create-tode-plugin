import type { MainToUI, UIToMain } from '../shared/messages';

type Handler<T extends UIToMain['type']> = (msg: Extract<UIToMain, { type: T }>) => void | Promise<void>;

type AnyHandler = (msg: UIToMain) => void | Promise<void>;

const handlers = new Map<string, AnyHandler>();
let listening = false;

export function postToUI(msg: MainToUI): void {
  figma.ui.postMessage(msg);
}

/** Registers a handler for one message type. Unknown types (including tode's own) are ignored. */
export function onUIMessage<T extends UIToMain['type']>(type: T, handler: Handler<T>): void {
  handlers.set(type, handler as unknown as AnyHandler);
  if (listening) return;
  listening = true;
  figma.ui.on('message', (raw: unknown) => {
    const msg = raw as { type?: unknown };
    if (!msg || typeof msg.type !== 'string') return;
    const h = handlers.get(msg.type);
    if (h) void h(msg as UIToMain);
  });
}

/** Messages the UI sends to the main thread. Add a variant here, then a handler in src/main/main.ts. */
export type UIToMain = { type: 'create-rectangles'; count: number } | { type: 'close' };

/** Messages the main thread sends to the UI. Add a variant here, then an onMainMessage() in the UI. */
export type MainToUI = { type: 'created'; count: number } | { type: 'settings'; count: number };

// Serves the UI in a browser tab; src/ui/dev/mock-figma.ts stands in for the main thread.
import { createServer } from 'vite';

const server = await createServer({
  configFile: 'vite.config.ui.ts',
  mode: 'development',
  server: { port: 5173, open: '/ui.html' },
});
await server.listen();
server.printUrls();

import { TodeClient } from '@tode-sdk/figma-vanilla';
import { onMainMessage, postToMain } from './messaging';

export function mountApp(root: HTMLElement): void {
  // One client for the UI's lifetime; it records the session.
  const tode = new TodeClient();
  window.addEventListener('beforeunload', () => tode.destroy());

  root.innerHTML = `
    <main>
      <h1>__TPL_NAME__</h1>
      <label>Rectangles <input id="count" type="number" min="1" max="100" value="5" /></label>
      <div class="row">
        <button id="create">Create</button>
        <button id="close" class="secondary">Close</button>
      </div>
      <p id="status" class="muted" hidden></p>
      <button id="help" class="link">How it works</button>
      <p id="help-text" class="muted" hidden>
        The UI posts a message; the main thread creates the nodes and records <code>rectangles_created</code> in tode.
      </p>
    </main>`;

  const count = root.querySelector<HTMLInputElement>('#count')!;
  const status = root.querySelector<HTMLElement>('#status')!;
  const helpText = root.querySelector<HTMLElement>('#help-text')!;
  const help = root.querySelector<HTMLButtonElement>('#help')!;

  root.querySelector('#create')!.addEventListener('click', () => postToMain({ type: 'create-rectangles', count: Number(count.value) }));
  root.querySelector('#close')!.addEventListener('click', () => postToMain({ type: 'close' }));
  help.addEventListener('click', () => {
    const open = helpText.hidden;
    if (open) tode.trackAction('help_opened');
    helpText.hidden = !open;
    help.textContent = open ? 'Hide' : 'How it works';
  });

  onMainMessage('settings', (m) => (count.value = String(m.count)));
  onMainMessage('created', (m) => {
    status.textContent = `Created ${m.count} rectangles.`;
    status.hidden = false;
  });
}

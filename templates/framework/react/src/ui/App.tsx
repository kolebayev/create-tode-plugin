import { useEffect, useState } from 'react';
import { useTode } from '@tode-sdk/figma-react';
import { onMainMessage, postToMain } from './messaging';

export function App() {
  // Mounting the hook at the root starts tode session tracking for this UI.
  const { trackAction, isReady } = useTode();
  const [count, setCount] = useState(5);
  const [created, setCreated] = useState<number | null>(null);
  const [help, setHelp] = useState(false);

  useEffect(() => onMainMessage('settings', (m) => setCount(m.count)), []);
  useEffect(() => onMainMessage('created', (m) => setCreated(m.count)), []);

  const toggleHelp = () => {
    if (!help) trackAction('help_opened');
    setHelp((v) => !v);
  };

  return (
    <main>
      <h1>__TPL_NAME__</h1>
      <label>
        Rectangles
        <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Number(e.target.value))} />
      </label>
      <div className="row">
        <button onClick={() => postToMain({ type: 'create-rectangles', count })}>Create</button>
        <button className="secondary" onClick={() => postToMain({ type: 'close' })}>Close</button>
      </div>
      {created !== null && <p className="muted">Created {created} rectangles.</p>}
      <button className="link" onClick={toggleHelp}>{help ? 'Hide' : 'How it works'}</button>
      {help && (
        <p className="muted">
          The UI posts a message; the main thread creates the nodes and records <code>rectangles_created</code> in tode.
          Analytics is {isReady ? 'on' : 'off'}.
        </p>
      )}
    </main>
  );
}

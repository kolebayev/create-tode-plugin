<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { createTodeStore } from '@tode-sdk/figma-svelte';
  import { onMainMessage, postToMain } from './messaging';

  // Creating the store at the root starts tode session tracking for this UI.
  const tode = createTodeStore();
  let count = $state(5);
  let created = $state<number | null>(null);
  let help = $state(false);

  const unsubscribe: Array<() => void> = [];
  onMount(() => {
    unsubscribe.push(onMainMessage('settings', (m) => (count = m.count)));
    unsubscribe.push(onMainMessage('created', (m) => (created = m.count)));
  });
  onDestroy(() => {
    unsubscribe.forEach((u) => u());
    tode.destroy();
  });

  function toggleHelp() {
    if (!help) tode.trackAction('help_opened');
    help = !help;
  }
</script>

<main>
  <h1>__TPL_NAME__</h1>
  <label>
    Rectangles
    <input type="number" min="1" max="100" bind:value={count} />
  </label>
  <div class="row">
    <button onclick={() => postToMain({ type: 'create-rectangles', count })}>Create</button>
    <button class="secondary" onclick={() => postToMain({ type: 'close' })}>Close</button>
  </div>
  {#if created !== null}<p class="muted">Created {created} rectangles.</p>{/if}
  <button class="link" onclick={toggleHelp}>{help ? 'Hide' : 'How it works'}</button>
  {#if help}
    <p class="muted">
      The UI posts a message; the main thread creates the nodes and records <code>rectangles_created</code> in tode.
      Analytics is {$tode.isReady ? 'on' : 'off'}.
    </p>
  {/if}
</main>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useTode } from '@tode-sdk/figma-vue';
import { onMainMessage, postToMain } from './messaging';

// Calling the composable at the root starts tode session tracking for this UI.
const { trackAction, isReady } = useTode();
const count = ref(5);
const created = ref<number | null>(null);
const help = ref(false);

const unsubscribe: Array<() => void> = [];
onMounted(() => {
  unsubscribe.push(onMainMessage('settings', (m) => (count.value = m.count)));
  unsubscribe.push(onMainMessage('created', (m) => (created.value = m.count)));
});
onUnmounted(() => unsubscribe.forEach((u) => u()));

function toggleHelp() {
  if (!help.value) trackAction('help_opened');
  help.value = !help.value;
}
</script>

<template>
  <main>
    <h1>__TPL_NAME__</h1>
    <label>
      Rectangles
      <input v-model.number="count" type="number" min="1" max="100" />
    </label>
    <div class="row">
      <button @click="postToMain({ type: 'create-rectangles', count })">Create</button>
      <button class="secondary" @click="postToMain({ type: 'close' })">Close</button>
    </div>
    <p v-if="created !== null" class="muted">Created {{ created }} rectangles.</p>
    <button class="link" @click="toggleHelp">{{ help ? 'Hide' : 'How it works' }}</button>
    <p v-if="help" class="muted">
      The UI posts a message; the main thread creates the nodes and records <code>rectangles_created</code> in tode.
      Analytics is {{ isReady ? 'on' : 'off' }}.
    </p>
  </main>
</template>

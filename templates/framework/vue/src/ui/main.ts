import { createApp } from 'vue';
import App from './App.vue';
import { installMockIfOutsideFigma } from './dev/mock-figma';
import './styles.css';

installMockIfOutsideFigma();
createApp(App).mount('#app');

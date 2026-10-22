import { mount } from 'svelte';
import App from './App.svelte';
import { installMockIfOutsideFigma } from './dev/mock-figma';
import './styles.css';

installMockIfOutsideFigma();
mount(App, { target: document.getElementById('app')! });

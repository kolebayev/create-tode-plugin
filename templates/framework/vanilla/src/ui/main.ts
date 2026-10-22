import { mountApp } from './app';
import { installMockIfOutsideFigma } from './dev/mock-figma';
import './styles.css';

installMockIfOutsideFigma();
mountApp(document.getElementById('app')!);

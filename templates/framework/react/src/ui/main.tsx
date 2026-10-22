import { createRoot } from 'react-dom/client';
import { App } from './App';
import { installMockIfOutsideFigma } from './dev/mock-figma';
import './styles.css';

installMockIfOutsideFigma();
createRoot(document.getElementById('app')!).render(<App />);

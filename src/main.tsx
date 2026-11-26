// Low-power phones (few cores, little memory, data saver): turn off ambient loops so scrolling stays smooth
try { const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }; if ((n.hardwareConcurrency || 8) <= 4 || (n.deviceMemory || 8) <= 3 || n.connection?.saveData || matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('lite') } catch { /* */ }
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

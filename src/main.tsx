import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

document.fonts.ready.then(() => {
  const inter = document.fonts.check('16px Inter');
  const brig = document.fonts.check('16px "Bricolage Grotesque"');
  console.log(`[Fonts] Inter: ${inter ? 'LOADED ✓' : 'NOT LOADED ✗'} | Bricolage Grotesque: ${brig ? 'LOADED ✓' : 'NOT LOADED ✗'}`);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

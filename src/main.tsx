import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set dark mode class on <html> based on localStorage
function applyDarkModeClass() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

applyDarkModeClass();
window.addEventListener('storage', (e) => {
  if (e.key === 'darkMode') applyDarkModeClass();
});

createRoot(document.getElementById("root")!).render(<App />);

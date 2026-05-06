import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/reset.css'
import './assets/style.scss'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

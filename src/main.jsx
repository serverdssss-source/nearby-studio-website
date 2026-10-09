import React from 'react'
import ReactDOM from 'react-dom/client'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'


// Drop the build-time prerendered HTML (kept for crawlers) and render the app as usual
const rootElement = document.getElementById('root')
rootElement.removeAttribute('data-prerendered')
rootElement.innerHTML = ''

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <SpeedInsights />
    </HelmetProvider>
  </React.StrictMode>,
)

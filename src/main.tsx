
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

// Add dark mode by default to the HTML document
document.documentElement.classList.add('dark')

const container = document.getElementById('root')

if (!container) {
  throw new Error('Failed to find the root element')
}

const root = createRoot(container)

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ArticlesDashboard from "./components/ArticlesDashboard";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div>
      <ArticlesDashboard/>
    </div>
  </StrictMode>,
)

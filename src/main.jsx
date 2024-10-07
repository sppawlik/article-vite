import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ArticleTable from "./components/article-table";
import Dashboard from './components/Dashboard';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Dashboard/>
  </StrictMode>,
)

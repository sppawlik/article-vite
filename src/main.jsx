import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ArticleTable from "./components/article-table";
import Dashboard from './components/Dashboard';
import SideDashboard from "./components/dashboard-06-v01";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SideDashboard/>
  </StrictMode>,
)

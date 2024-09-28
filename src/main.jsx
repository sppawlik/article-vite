import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ArticleTable from "@/components/article-table";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ArticleTable />
  </StrictMode>,
)

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { BookmarkIcon, StarIcon } from 'lucide-react'
import { Article, getArticles } from '@/services/articleService'
import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function ArticleTable() {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
  
    const fetchArticles = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedArticles = await getArticles()
        setArticles(fetchedArticles)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching articles.')
      } finally {
        setLoading(false)
      }
    }
  
    useEffect(() => {
      fetchArticles()
    }, [])
  
    if (loading) {
      return <div>Loading articles...</div>
    }

    if (error) {
      return <div>Error: {error}</div>
    }

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleGenerateNewsletter = () => {
        // Placeholder for newsletter generation logic
        console.log("Generating newsletter with filtered articles:", filteredArticles)
        // Here you would typically call an API or perform some action to generate the newsletter
      }

    return (
        <div>
            <div className="flex justify-between items-center">
            <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm mb-4"
            />
            <Button onClick={handleGenerateNewsletter}>
          Generate Newsletter
        </Button>
            </div>
            {filteredArticles.length === 0 ? (
                <div>No articles found matching your search.</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[200px]">Source</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-[100px]">Age</TableHead>
                            <TableHead className="w-[100px]">Relevance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredArticles.map((article, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <BookmarkIcon className="h-4 w-4" />
                                </TableCell>
                                <TableCell>{article.source}</TableCell>
                                <TableCell>
                                    <a href={article.url} className="text-primary hover:underline">
                                        {article.title}
                                    </a>
                                    {" "}
                                    <span className="text-muted-foreground text-sm">{article.summary}</span>
                                </TableCell>
                                <TableCell>{article.relativeDate}</TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div className="flex items-center">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <StarIcon
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < article.relevance ? 'text-primary' : 'text-muted'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Score 1: {article.score1}</p>
                                                <p>Score 2: {article.score2}</p>
                                                <p>Score 3: {article.score3}</p>
                                                <p>Score 4: {article.score4}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
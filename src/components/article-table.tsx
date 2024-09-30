import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { Article, getArticles } from '@/services/articleService'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ArticleTable() {
    const [articles, setArticles] = useState<Article[]>([])
    const [ageFilter, setAgeFilter] = useState<number | ''>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    useEffect(() => {
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

        fetchArticles()
    }, [])

    const filteredArticles = useMemo(() => {
        if (ageFilter === '') return articles;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - ageFilter);
        
        return articles.filter(article => {
            if (!article.publishedDate) return false;
            const publishedDate = new Date(article.publishedDate);
            return !isNaN(publishedDate.getTime()) && publishedDate >= cutoffDate;
        });
    }, [articles, ageFilter]);

    const sortedArticles = useMemo(() => {
        return [...filteredArticles].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.relevance - b.relevance
            } else {
                return b.relevance - a.relevance
            }
        })
    }, [filteredArticles, sortOrder])

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc')
    }

    const handleGenerateNewsletter = () => {
        console.log("Generating newsletter with articles:", filteredArticles)
    }

    const handleAgeFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setAgeFilter('');
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0) {
                setAgeFilter(numValue);
            }
        }
    }

    if (loading) {
        return <div>Loading articles...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div className="flex-1 flex gap-2">
                    <Input
                        type="number"
                        placeholder="Age in days"
                        value={ageFilter}
                        onChange={handleAgeFilterChange}
                        min="0"
                        className="w-32"
                    />
                </div>
                <Button onClick={handleGenerateNewsletter}>
                    Generate Newsletter
                </Button>
            </div>
            {sortedArticles.length === 0 ? (
                <div>No articles found matching the current filter.</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Source</TableHead>
                            <TableHead className="whitespace-nowrap overflow-hidden text-ellipsis">Title</TableHead>
                            <TableHead className="w-[100px]">Age</TableHead>
                            <TableHead className="w-[100px] cursor-pointer" onClick={toggleSortOrder}>
                                <div className="flex items-center">
                                    Relevance
                                    {sortOrder === 'asc' ? (
                                        <ChevronUpIcon className="ml-1 h-4 w-4" />
                                    ) : (
                                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="w-[120px]">Summary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedArticles.map((article, index) => (
                            <TableRow key={index}>
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
                                                    {article.relevance}
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
                                <TableCell>
                                    <Select>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="-">-</SelectItem>
                                            <SelectItem value="light">Small</SelectItem>
                                            <SelectItem value="dark">Avg</SelectItem>
                                            <SelectItem value="system">Big</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
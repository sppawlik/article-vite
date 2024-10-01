import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { Article, getArticles } from '@/services/articleService'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from './ui/label'
import { Slider } from './ui/slider'

export default function ArticleTable() {
    const [articles, setArticles] = useState<Article[]>([])
    const [ageFilter, setAgeFilter] = useState<number | ''>('')
    const [ratingFilter, setRatingFilter] = useState<number[]>([1, 5])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [summaryValues, setSummaryValues] = useState<{ [key: number]: string }>({})

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
        return articles.filter(article => {
            // Age filter
            if (ageFilter !== '') {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - Number(ageFilter));
                
                if (!article.publishedDate) return false;
                const publishedDate = new Date(article.publishedDate);
                if (isNaN(publishedDate.getTime()) || publishedDate < cutoffDate) return false;
            }
            
            // Rating filter
            return !(article.rating < ratingFilter[0] || article.rating > ratingFilter[1]);
            

        });
    }, [articles, ageFilter, ratingFilter]);

    const sortedArticles = useMemo(() => {
        return [...filteredArticles].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.rating - b.rating
            } else {
                return b.rating - a.rating
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

    const handleSummaryChange = (index: number, value: string) => {
        setSummaryValues(prev => ({ ...prev, [index]: value }))
    }

    if (loading) {
        return <div>Loading articles...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex gap-4">
                    <div className="w-32">
                    <Label htmlFor="age-filter" className="text-sm">Age (days)</Label>
                        <Input
                            id="age-filter"
                            type="number"
                            value={ageFilter}
                            onChange={handleAgeFilterChange}
                            min={1}
                            max={365}
                            className="h-8"
                        />
                    </div>
                    <div className="w-48">
                        <Label className="text-sm">Rating</Label>
                        <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={ratingFilter}
                            onValueChange={setRatingFilter}
                            className="mt-2"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{ratingFilter[0]}</span>
                                <span>{ratingFilter[1]}</span>
                        </div>
                    </div>
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
                                    Rating
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
                            <TableRow 
                                key={index}
                                className={['dark', 'light', 'system'].includes(summaryValues[index]) ? 'bg-gray-200' : ''}
                            >
                                <TableCell>{article.source}</TableCell>
                                <TableCell>
                                <div className="max-h-[3em] overflow-hidden">
                                    <a href={article.url} className="text-primary hover:underline">
                                        {article.title}
                                    </a>
                                    {" "}
                                    <span className="text-muted-foreground text-sm">{article.summary}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{article.relativeDate}</TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div className="flex items-center">
                                                    {article.rating}
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
                                    <Select onValueChange={(value) => handleSummaryChange(index, value)}>
                                        <SelectTrigger className="w-[120px]">
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
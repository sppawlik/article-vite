import React, { useState, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { UserArticle } from "@/api/articleService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SummarySize } from "@/types/types";

const SUMMARY_OPTIONS: SummarySize[] = ['short', 'medium', 'long'];

type SelectedArticlesMap = { [key: number]: SummarySize };

interface ArticleTableProps {
    articles: UserArticle[];
    onGenerateNewsletter: (articles: Record<SummarySize, string[]>) => void;
    selectedArticles: SelectedArticlesMap;
    onSelectedArticlesChange: (selected: SelectedArticlesMap | ((prev: SelectedArticlesMap) => SelectedArticlesMap)) => void;
}

export function ArticleTable({ 
    articles, 
    onGenerateNewsletter,
    selectedArticles,
    onSelectedArticlesChange
}: ArticleTableProps) {
    const [ageFilter, setAgeFilter] = useState<number | ''>('');
    const [ratingFilter, setRatingFilter] = useState<number[]>([1, 5]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
                return a.rating - b.rating;
            } else {
                return b.rating - a.rating;
            }
        });
    }, [filteredArticles, sortOrder]);

    const toggleSortOrder = useCallback(() => {
        setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    }, []);

    const handleGenerateNewsletter = useCallback(() => {
        const result: Record<SummarySize, string[]> = {
            short: [],
            medium: [],
            long: []
        };

        // Transform selectedArticles into the required format
        Object.entries(selectedArticles).forEach(([index, size]) => {
            const article: UserArticle = sortedArticles[parseInt(index)];
            if (article?.link) {
                result[size].push(article.link);
            }
        });
        onGenerateNewsletter(result);
    }, [selectedArticles, sortedArticles, onGenerateNewsletter]);

    const handleAgeFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setAgeFilter('');
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0) {
                setAgeFilter(numValue);
            }
        }
    }, []);

    const handleSummaryChange = useCallback((index: number, value: SummarySize | '-') => {
        onSelectedArticlesChange((prev: SelectedArticlesMap) => {
            const newValues = { ...prev };
            if (value === '-') {
                delete newValues[index];
            } else {
                newValues[index] = value as SummarySize;
            }
            return newValues;
        });
    }, [onSelectedArticlesChange]);

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
                            aria-label="Filter articles by age in days"
                        />
                    </div>
                    <div className="w-48">
                        <Label className="text-sm">Rating</Label>
                        <Slider
                            min={0}
                            max={5}
                            step={1}
                            value={ratingFilter}
                            onValueChange={setRatingFilter}
                            className="mt-2"
                            aria-label="Filter articles by rating"
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
                            <TableHead className="w-[200px] text-left">Source</TableHead>
                            <TableHead className="whitespace-nowrap overflow-hidden text-ellipsis text-left">Title</TableHead>
                            <TableHead className="w-[100px] text-left">Age</TableHead>
                            <TableHead className="w-[100px] cursor-pointer text-left" onClick={toggleSortOrder}>
                                <div className="flex items-center">
                                    Rating
                                    {sortOrder === 'asc' ? (
                                        <ChevronUpIcon className="ml-1 h-4 w-4" />
                                    ) : (
                                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="w-[100px] text-left">Simplified</TableHead>
                            <TableHead className="w-[120px] text-left">Summary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedArticles.map((article, index) => (
                            <TableRow 
                                key={index}
                                className={selectedArticles[index] ? 'bg-gray-200' : ''}
                            >
                                <TableCell className="text-left">
                                    <div className="flex flex-col">
                                        <span>{article?.hostDomain}</span>
                                        <span className="text-sm text-muted-foreground">{(article?.source ?? '').split(' ').slice(0, 2).join(' ')}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-left">
                                    <div className="max-h-[3em] overflow-hidden w-[800px]">
                                        <a href={article.link} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                            {article.title}
                                        </a>
                                        {" "}
                                        <span className="text-muted-foreground text-sm">{article.summary}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-left">{article.relativeDate}</TableCell>
                                <TableCell className="text-left">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <div className="flex items-center">
                                                    {article.rating}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Relevance: {article.score.relevance}</p>
                                                <p>Quality: {article.score.quality}</p>
                                                <p>Depth and originality: {article.score.depth_and_originality}</p>
                                                <p>Simplified: {article.score.simplified}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell className="text-left">{article.score.simplified}</TableCell>
                                <TableCell className="text-left">
                                    <Select 
                                        value={selectedArticles[index] || '-'}
                                        onValueChange={(value) => handleSummaryChange(index, value as SummarySize | '-')}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="-">-</SelectItem>
                                            {SUMMARY_OPTIONS.map((size) => (
                                                <SelectItem key={size} value={size}>
                                                    {size.charAt(0).toUpperCase() + size.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

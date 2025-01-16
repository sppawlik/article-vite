import React, { useState, useMemo, useCallback, lazy, Suspense, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react';
import {UserArticle, listUserArticles, listCurrentUserArticles, getUserArticles} from "@/api/articleService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { SummarySize } from "@/types/types";
import { debounce } from 'lodash-es';

// Lazy load the Dialog component and its related components
const AddArticleDialog = lazy(() => import('./AddArticleDialog'));

const SUMMARY_OPTIONS: SummarySize[] = ['short', 'medium', 'long'];

type SelectedArticlesMap = { [key: string]: SummarySize };

interface ArticleTableProps {
    onGenerateNewsletter: (articles: Record<SummarySize, string[]>) => void;
    selectedArticles: SelectedArticlesMap;
    onSelectedArticlesChange: (selected: SelectedArticlesMap | ((prev: SelectedArticlesMap) => SelectedArticlesMap)) => void;
}

// Extracted ArticleRow component to prevent unnecessary re-renders
const ArticleRow = React.memo(({ 
    article, 
    isSelected, 
    selectedSize,
    onSummaryChange 
}: { 
    article: UserArticle;
    isSelected: boolean;
    selectedSize: SummarySize | undefined;
    onSummaryChange: (link: string, value: SummarySize | '-') => void;
}) => (
    <TableRow className={isSelected ? 'bg-gray-200' : ''}>
        <TableCell className="text-left max-w-[180px]">
            <div className="flex flex-col">
                <span className='truncate text-ellipsis overflow-hidden'>{article?.hostDomain}</span>
            </div>
        </TableCell>
        <TableCell className="text-left min-w-0">
            <div className="max-h-[3em] overflow-hidden max-w-[1000px]">
                <a href={article.link} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {article.title}
                </a>
                {" "}
                <span className="text-muted-foreground text-sm ">{article.summary}</span>
            </div>
        </TableCell>
        <TableCell className="text-left min-w-100">{article.relativeDate}</TableCell>
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
                        <p>Depth and originality: {article.score.depth_and_originality}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </TableCell>
        <TableCell className="text-left">
            <Select 
                value={selectedSize || '-'}
                onValueChange={(value) => onSummaryChange(article.link, value as SummarySize | '-')}
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
));

ArticleRow.displayName = 'ArticleRow';

export function ArticleTable({ 
    onGenerateNewsletter,
    selectedArticles,
    onSelectedArticlesChange
}: ArticleTableProps) {
    const [articles, setArticles] = useState<UserArticle[]>([]);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [ageFilter, setAgeFilter] = useState<number | ''>(7);

    const fetchArticles = useCallback(async () => {
        if (hasFetched) return;

        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setLoadingArticles(true);
        setError(null);
        try {
            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - (ageFilter === '' ? 7 : ageFilter));
            const fetchedArticles = await listCurrentUserArticles(sinceDate);
            
            // Only update state if this request wasn't aborted
            if (!abortController.signal.aborted) {
                setArticles(fetchedArticles);
                setHasFetched(true);
            }
        } catch (err) {
            // Only set error if this request wasn't aborted
            if (!abortController.signal.aborted && err instanceof Error && err.name !== 'AbortError') {
                setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching articles.');
            }
        } finally {
            if (!abortController.signal.aborted) {
                setLoadingArticles(false);
            }
            if (abortControllerRef.current === abortController) {
                abortControllerRef.current = null;
            }
        }
    }, [hasFetched, ageFilter]);

    useEffect(() => {
        if (!hasFetched) {
            fetchArticles();
        }

        // Cleanup function to abort any ongoing request when component unmounts
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
        };
    }, [fetchArticles, hasFetched]);

    const refreshArticles = useCallback(() => {
        setHasFetched(false);
    }, []);

    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const filteredArticles = useMemo(() => {
        return articles.filter(article => {
            // Age filter
            if (ageFilter !== '') {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() -  ageFilter);
                
                if (!article.publishedDate) return false;
                const publishedDate = new Date(article.publishedDate);
                if (isNaN(publishedDate.getTime()) || publishedDate < cutoffDate) return false;
            }
            return true;
        });
    }, [articles, ageFilter]);

    const sortedArticles = useMemo(() => {
        return [...filteredArticles].sort((a, b) => {
            const aRating = a.rating ?? 0;
            const bRating = b.rating ?? 0;
            if (aRating !== bRating) {
                if (sortOrder === 'asc') {
                    return aRating - bRating;
                } else {
                    return bRating - aRating;
                }
            } else {
                const aPublishedDate = a.publishedDate ? new Date(a.publishedDate) : new Date();
                const bPublishedDate = b.publishedDate ? new Date(b.publishedDate) : new Date();
                return bPublishedDate.getTime() - aPublishedDate.getTime();
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
        
        Object.entries(selectedArticles).forEach(([link, size]) => {
            result[size].push(link);
        });
        
        onGenerateNewsletter(result);
    }, [selectedArticles, onGenerateNewsletter]);

    const debouncedSetHasFetched = useCallback(
        debounce((value: boolean) => {
            setHasFetched(value);
        }, 400),
        []
    );

    const handleAgeFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '') {
            setAgeFilter('');
            setHasFetched(true);
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0) {
                setAgeFilter(numValue);
                debouncedSetHasFetched(false);
            }
        }
    }, [debouncedSetHasFetched]);

    const handleSummaryChange = useCallback((link: string, value: SummarySize | '-') => {
        onSelectedArticlesChange((prev: SelectedArticlesMap) => {
            const newValues = { ...prev };
            if (value === '-') {
                delete newValues[link];
            } else {
                newValues[link] = value as SummarySize;
            }
            return newValues;
        });
    }, [onSelectedArticlesChange]);

    const handleDialogClose = useCallback(async (url?: string) => {
        setIsAddDialogOpen(false);
        if (url) {
            console.log('Fetching article:', url);
            try {
                const newArticle = await getUserArticles(url);
                console.log('New article:', newArticle);
                setArticles(prevArticles => [...prevArticles, newArticle]);
            } catch (error) {
                console.error('Error fetching article:', error);
                setError(error instanceof Error ? error.message : 'Failed to fetch the article');
            }
        }
    }, []);

    return (
        <div className="space-y-4">
            <div className="min-w-[1000px] flex justify-between items-end">
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
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleGenerateNewsletter}>
                        Generate Newsletter
                    </Button>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Article
                    </Button>
                </div>
            </div>
            {loadingArticles ? (
                <div>Loading articles...</div>
            ) : error ? (
                <div>Error: {error}</div>
            ) : sortedArticles.length === 0 ? (
                <div>No articles found matching the current filter.</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left">Source</TableHead>
                            <TableHead className="whitespace-nowrap overflow-hidden text-ellipsis text-left">Title</TableHead>
                            <TableHead className="text-left">Age</TableHead>
                            <TableHead className="cursor-pointer text-left" onClick={toggleSortOrder}>
                                <div className="flex items-center">
                                    Rating
                                    {sortOrder === 'asc' ? (
                                        <ChevronUpIcon className="ml-1 h-4 w-4" />
                                    ) : (
                                        <ChevronDownIcon className="ml-1 h-4 w-4" />
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="w-[120px] text-left">Summary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedArticles.map((article) => (
                            <ArticleRow
                                key={article.link}
                                article={article}
                                isSelected={!!selectedArticles[article.link]}
                                selectedSize={selectedArticles[article.link]}
                                onSummaryChange={handleSummaryChange}
                            />
                        ))}
                    </TableBody>
                </Table>
            )}
            
            {/* Lazy loaded dialog */}
            <Suspense fallback={<div>Loading...</div>}>
                {isAddDialogOpen && (
                    <AddArticleDialog
                        isOpen={isAddDialogOpen}
                        onClose={handleDialogClose}
                    />
                )}
            </Suspense>
        </div>
    );
}
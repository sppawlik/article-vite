import { describe, it, expect } from 'vitest';

interface Article {
    id: string;
    title: string;
    rating?: number | null;
    publishedDate?: Date | null;
}

describe('ArticleTable sorting logic', () => {
    const mockArticles: Article[] = [
        { id: '1', title: 'Article 1', rating: 4, publishedDate: new Date('2023-01-01') },
        { id: '2', title: 'Article 2', rating: 5, publishedDate: new Date('2023-02-01') },
        { id: '3', title: 'Article 3', rating: null, publishedDate: new Date('2023-03-01') },
        { id: '4', title: 'Article 4', rating: 4, publishedDate: new Date('2023-04-01') },
        { id: '5', title: 'Article 5', rating: undefined, publishedDate: null }
    ];

    const sortArticles = (articles: Article[], sortOrder: 'asc' | 'desc') => {
        return [...articles].sort((a, b) => {
            const aRating = a.rating ?? 0;
            const bRating = b.rating ?? 0;
            if (aRating !== bRating) {
                if (sortOrder === 'asc') {
                    return aRating - bRating;
                } else {
                    return bRating - aRating;
                }
            } else {
                const aPublishedDate = a.publishedDate ? a.publishedDate : new Date();
                const bPublishedDate = b.publishedDate ? b.publishedDate : new Date();
                return bPublishedDate.getTime() - aPublishedDate.getTime();
            }
        });
    };


    it('should sort by published date when ratings are equal', () => {
        const sorted = sortArticles(mockArticles, 'asc');
        
        console.log( new Date('2025-01-15T00:00:00+00:00'))
        console.log(getRelativeTime(new Date('2025-01-15T00:00:00+00:00'), new Date()))
        // Find articles with rating 4
        const rating4Articles = sorted.filter(article => article.rating === 4);
        expect(rating4Articles).toHaveLength(2);
        
        // Most recent should come first
        expect(rating4Articles[0].publishedDate).toStrictEqual(new Date('2023-04-01'));
        expect(rating4Articles[1].publishedDate).toStrictEqual(new Date('2023-01-01'));
    });

    function getRelativeTime(pastDate: Date, currentDate: Date): string {
        const diffInSeconds = Math.floor(
            (currentDate.getTime() - pastDate.getTime()) / 1000
        );
    
        const intervals = [
            {label: "y", seconds: 365 * 24 * 60 * 60},
            {label: "m", seconds: 30 * 24 * 60 * 60},
            {label: "d", seconds: 24 * 60 * 60},
            {label: "h", seconds: 60 * 60},
            {label: "m", seconds: 60},
            {label: "s", seconds: 1},
        ];
    
        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return `${count}${interval.label}`;
            }
        }
        return "just now";
    }

   
});

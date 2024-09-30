export interface Article {
  source: string
  title: string
  summary: string
  url: string
  relativeDate: string
  relevance: number
  score1: number
  score2: number
  score3: number
  score4: number
}

interface APIArticle {
  Source: string
  Title: string
  Summary: string
  URL: string
  PublishedDate: string
}

interface APIArticleEnhanced {
  Source: string
  Title: string
  Summary: string
  URL: string
  PublishedDate: string,
  publishedDate: Date
}

const API_URL = '/api/articles';

export async function getArticles(): Promise<Article[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: APIArticle[] = await response.json();
    const dataEnhanced: APIArticleEnhanced[] = data.map((item: APIArticle) => ({
      ...item, publishedDate: new Date(item.PublishedDate)
    })).sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())


    return dataEnhanced.map((item: APIArticleEnhanced) => ({
      source: item.Source,
      title: item.Title,
      summary: item.Summary,
      url: item.URL,
      relativeDate: getRelativeTime(new Date(item.PublishedDate), new Date()),
      relevance: 4, // Default value, adjust as needed
      score1: 2, // Default value, adjust as needed
      score2: 2, // Default value, adjust as needed
      score3: 2, // Default value, adjust as needed
      score4: 2  // Default value, adjust as needed
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

function getRelativeTime(pastDate: Date, currentDate: Date): string {
  const diffInSeconds = Math.floor((currentDate.getTime() - pastDate.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 365 * 24 * 60 * 60 },
    { label: 'month', seconds: 30 * 24 * 60 * 60 },
    { label: 'day', seconds: 24 * 60 * 60 },
    { label: 'hour', seconds: 60 * 60 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''}`;
    }
  }
  return 'just now';
}

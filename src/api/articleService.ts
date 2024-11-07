import type { Schema } from '../../amplify/data/resource'
import { generateClient } from 'aws-amplify/data'

const client = generateClient<Schema>()

export interface Article {
  source: string
  articleId: string
  title: string
  summary: string
  url: string
  relativeDate: string
  publishedDate?: Date
  score: Score
  rating: number
}

interface Score {
  depth_and_originality: number
  quality: number
  relevance: number
  rating: number
  simplified: number
}

interface APIArticle {
  Source: string
  ArticleId: string
  Title: string
  Summary: string
  URL: string
  PublishedDate: string
  Score: Score
}

interface APIArticleEnhanced {
  Source: string
  ArticleId: string
  Title: string
  Summary: string
  URL: string
  PublishedDate: string,
  publishedDate: Date,
  Score: Score
}

const API_URL = 'https://k7f0d24lyb.execute-api.eu-central-1.amazonaws.com/prod/articles';

export async function getUserArticles(): Promise<Article[]> {

  const { data: items, errors } = await client.models.UserArticle.list();

    if (errors) {
        console.error('Error fetching user articles:', errors);
        return [];
    }

    return items.map((item) => ({
        source: item.source ?? '',
        articleId: item.link ?? '',
        title: item.title ??  '',
        summary: item.summary ?? '',
        url: item.url ??  '',
        relativeDate: getRelativeTime(new Date(item.publishedDate ?? ''), new Date()),
        publishedDate: new Date(item.publishedDate ?? ''),
        score: JSON.parse(item.score as string ?? '') as Score ?? { depth_and_originality: 0, quality: 0, relevance: 0, rating: 0, simplified: 0 },
        rating: (JSON.parse(item.score as string ?? '') as Score)?.rating/10
    }));
}

export async function getArticles(): Promise<Article[]> {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return [];
    }
    const data: APIArticle[] = await response.json();
    console.log('Size:',data.length);
    const dataEnhanced: APIArticleEnhanced[] = data.map((item: APIArticle) => ({
      ...item, publishedDate: new Date(item.PublishedDate)
    })).sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())


    return dataEnhanced.map((item: APIArticleEnhanced) => ({
      source: item.Source,
      articleId: item.ArticleId,
      title: item.Title,
      summary: item.Summary,
      url: item.URL,
      relativeDate: getRelativeTime(new Date(item.PublishedDate), new Date()),
      publishedDate: item.publishedDate,
      score:item.Score,
      rating: item.Score.rating/10,
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

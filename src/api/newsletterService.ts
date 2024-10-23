import { SummarySize } from '../types/types';

interface NewsletterArticles {
    articles: Record<SummarySize, string[]>;
}

interface NewsletterResponse {
    newsletterId: string;
}

const NEWSLETTER_API_URL = 'https://fzczuzbp33.execute-api.eu-central-1.amazonaws.com/prod/newsletter';

export async function submitNewsletter(articles: NewsletterArticles): Promise<string> {
    try {
        const response = await fetch(NEWSLETTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(articles)
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`Failed to submit newsletter: ${response.statusText}`);
        }

        const data: NewsletterResponse = await response.json();
        return data.newsletterId;
    } catch (error) {
        console.error('Error submitting newsletter:', error);
        throw error;
    }
}

export type SummarySize = 'short' | 'medium' | 'long';

export interface Newsletter {
    newsletterId: string;
    status: string;
    articles: Record<SummarySize, string[]>;
    createDate: string;
    baseNewsletter: string;
}

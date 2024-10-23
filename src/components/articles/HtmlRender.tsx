import React from 'react';
import DOMPurify from 'dompurify';

interface RawHTMLRendererProps {
    html: string;
    sanitize?: boolean;
}

export default function HtmlRender({ html, sanitize = true }: RawHTMLRendererProps = { html: '<p>Default HTML</p>' }) {
    const sanitizeHTML = (dirty: string) => {
        return {
            __html: DOMPurify.sanitize(dirty)
        };
    };

    return (
        <div className="p-4 border rounded-md">
            {sanitize ? (
                <div dangerouslySetInnerHTML={sanitizeHTML(html)} />
            ) : (
                <div dangerouslySetInnerHTML={{ __html: html }} />
            )}
        </div>
    );
}
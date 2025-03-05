import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {Authenticator} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';
import {Amplify} from "aws-amplify";
import {MainNewsletterArticles} from "@/features/articlelisting/MainNewsletterArticles";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NewsletterView } from '@/features/newsletter';
import NewsletterStatusWrapper from '@/features/statusdialog/NewsletterStatusWrapper';

Amplify.configure(outputs);
const currentConfig = Amplify.getConfig();
Amplify.configure({
    ...currentConfig,
    Auth: {
        Cognito: {
            userPoolId: "eu-central-1_FhFqdxUtA",
            userPoolClientId: "3lc34i5u9qdc5qni7i4vlakq9p",
        }
    },
    API: {
        GraphQL: {
            endpoint: 'https://x5pjdqz5m5ejxf6sfd54fwhms4.appsync-api.eu-central-1.amazonaws.com/graphql',
            region: 'eu-central-1',
            defaultAuthMode: 'userPool'
        }
    }
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Authenticator>
            <NewsletterStatusWrapper>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<div className='flex justify-center'><MainNewsletterArticles /></div>} />
                        <Route path="/newsletter/:uuid" element={<NewsletterView />} />
                    </Routes>
                </BrowserRouter>
            </NewsletterStatusWrapper>
        </Authenticator>
    </StrictMode>
);

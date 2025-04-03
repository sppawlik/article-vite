import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {Authenticator} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';
import {Amplify} from "aws-amplify";
import {MainPanel} from "@/features/articlelisting/MainPanel";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NewsletterView } from '@/features/newsletter';
import Onboarding from '@/features/onboarding/Onboarding';

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
            endpoint: 'https://hlsolbtwbnaurd56bzkxzceio4.appsync-api.eu-central-1.amazonaws.com/graphql',
            region: 'eu-central-1',
            defaultAuthMode: 'userPool'
        }
    }
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Authenticator>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<div className='flex justify-center'><MainPanel /></div>} />
                    <Route path="/newsletter/:uuid" element={<NewsletterView />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                </Routes>
            </BrowserRouter>
        </Authenticator>
    </StrictMode>
);

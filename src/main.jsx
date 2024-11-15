import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { SideBarDashboard } from "@/features/dashboard/SideBarDashboard";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';
import { Amplify } from "aws-amplify";
import {ApolloClient, ApolloProvider, InMemoryCache} from '@apollo/client';

Amplify.configure(outputs);
// const currentConfig = Amplify.getConfig();
// Amplify.configure({
//     ...currentConfig,
//     API: {
//         GraphQL: {
//             endpoint: 'https://cglclqvvjvh4tjmiaxz4gdrili.appsync-api.eu-central-1.amazonaws.com/graphql',
//             region: 'us-east-1',
//             // Set the default auth mode to "apiKey" and provide the API key value
//             defaultAuthMode: 'apiKey',
//             apiKey: 'da2-jm4mxuuosbfudcetzhvjtshrme'
//         }
//     }});



const client = new ApolloClient({
    uri: 'https://7gckwk6tk5ffzf5uko3vlsrrku.appsync-api.eu-central-1.amazonaws.com/graphql',
    cache: new InMemoryCache(),
    headers: {
        'x-api-key': 'da2-nczy4uno6bcmffd2zoya2voszq'
    }
});

// Supported in React 18+

createRoot(document.getElementById('root')).render(
    <ApolloProvider client={client}>
        <StrictMode>
            <Authenticator>
                <SideBarDashboard />
            </Authenticator>
        </StrictMode>
    </ApolloProvider>
);

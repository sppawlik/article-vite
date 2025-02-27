import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {Authenticator} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';
import {Amplify} from "aws-amplify";
import {MainNewsletterArticles} from "@/features/articlelisting/MainNewsletterArticles";
Amplify.configure(outputs);
const currentConfig = Amplify.getConfig();
Amplify.configure({
    ...currentConfig,
    Auth: {
        Cognito: {
            userPoolId: "eu-central-1_Qbr5qspCI",
            userPoolClientId: "u8lbvcvunndrac7mmhucormr3",
        }
    },
    API: {
        GraphQL: {
            endpoint: 'https://62g3ncbqdbfb3ejkpztpgpva6y.appsync-api.eu-central-1.amazonaws.com/graphql',
            region: 'eu-central-1',
            defaultAuthMode: 'userPool'
        }
    }
});

createRoot(document.getElementById('root')).render(
        <StrictMode>
            <Authenticator>
                <div className='flex justify-center'><MainNewsletterArticles /></div>
            </Authenticator>
        </StrictMode>
);

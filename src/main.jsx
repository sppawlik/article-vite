import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {SideBarDashboard} from "@/features/dashboard/SideBarDashboard";
import {Authenticator} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';
import {Amplify} from "aws-amplify";
import {ApolloClient, ApolloProvider, InMemoryCache} from '@apollo/client';


Amplify.configure(outputs);
const currentConfig = Amplify.getConfig();
Amplify.configure({
    ...currentConfig,
    Auth: {
        Cognito: {
            userPoolId: "eu-central-1_bIWHnJVBD",
            userPoolClientId: "17po79u1lq2hlvij0gnkulhkq4",
            // loginWith: {
            //     email: true,
            // },
            // signUpVerificationMethod: "code",
            // userAttributes: {
            //     email: {
            //         required: true,
            //     },
            // },
            // allowGuestAccess: true,
            // passwordFormat: {
            //     minLength: 8,
            //     requireLowercase: true,
            //     requireUppercase: true,
            //     requireNumbers: true,
            //     requireSpecialCharacters: true,
            // },
        }
    },
    API: {
        GraphQL: {
            endpoint: 'https://sw7s4gupwbesxmbt3sjalzogli.appsync-api.eu-central-1.amazonaws.com/graphql',
            region: 'eu-central-1',
            // Set the default auth mode to "apiKey" and provide the API key value
            defaultAuthMode: 'userPool',
            apiKey: 'da2-jm4mxuuosbfudcetzhvjtshrme'
        }
    }
});

/*
import { Amplify } from "aws-amplify"

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "<your-cognito-user-pool-id>",
      userPoolClientId: "<your-cognito-user-pool-client-id>",
      identityPoolId: "<your-cognito-identity-pool-id>",
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code",
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
})
 */

// const tokens = await cognitoUserPoolsTokenProvider.getTokens()
// const accessToken = tokens.accessToken ? tokens.accessToken.toString() : null;
//
// console.log('tokens', accessToken);


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
                <SideBarDashboard/>
            </Authenticator>
        </StrictMode>
    </ApolloProvider>
);

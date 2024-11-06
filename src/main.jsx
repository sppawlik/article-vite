import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { SideBarDashboard } from "@/features/dashboard/SideBarDashboard";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';
import { Amplify } from "aws-amplify";

Amplify.configure(outputs);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Authenticator>
            <SideBarDashboard />
        </Authenticator>
    </StrictMode>,
);

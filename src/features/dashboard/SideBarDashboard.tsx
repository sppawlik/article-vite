import React, {useState} from "react";
import {Home, LineChart, Newspaper, LogOut, Users2,} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";
import { useAuthenticator } from '@aws-amplify/ui-react';

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import {NewsletterBuilder} from "@/features/newsletter/NewsletterBuilder";
import {ToDo} from "../todo/ToDo";

export function SideBarDashboard() {
    const [activeComponent, setActiveComponent] = useState('articles');

    const { signOut } = useAuthenticator();
    const renderMainContent = () => {
        switch (activeComponent) {
            case 'articles':
                return <NewsletterBuilder/>;
            case 'todo':
            default:
                return <ToDo/>;
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 hidden flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center ">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveComponent('articles');
                                    }}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                                        activeComponent === 'articles' ? 'bg-accent text-accent-foreground' : ''
                                    }`}
                                >
                                    <Newspaper className="h-5 w-5"/>
                                    <span className="sr-only">Articles</span>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">Articles</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        signOut();
                                    }}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                                >
                                    <LogOut className="h-5 w-5"/>
                                    <span className="sr-only">Logout</span>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">Logout</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
            </aside>
            <div className="flex flex-col">
                <main className="grid flex-1 items-start">
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
}

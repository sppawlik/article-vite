import React, {useState} from "react";
import {Home, LineChart, Package, Settings, Users2,} from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "@/components/ui/tooltip";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import {NewsletterBuilder} from "@/features/newsletter/NewsletterBuilder";
import {ToDo} from "../todo/ToDo";

export function SideBarDashboard() {
    const [activeComponent, setActiveComponent] = useState('articles');

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
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 py-14">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="#"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                                >
                                    <Home className="h-5 w-5"/>
                                    <span className="sr-only">Dashboard</span>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">Dashboard</TooltipContent>
                        </Tooltip>
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
                                    <Package className="h-5 w-5"/>
                                    <span className="sr-only">Articles</span>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">Articles</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveComponent('todo');
                                    }}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                                        activeComponent === 'todo' ? 'bg-accent text-accent-foreground' : ''
                                    }`}
                                >
                                    <Users2 className="h-5 w-5"/>
                                    <span className="sr-only">Todo</span>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">Todo</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActiveComponent('markdown');
                                    }}
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
                                        activeComponent === 'markdown' ? 'bg-accent text-accent-foreground' : ''
                                    }`}
                                >
                                    <LineChart className="h-5 w-5"/>
                                    <span className="sr-only">Markdown</span>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">Markdown</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href="#"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                                >
                                    <Settings className="h-5 w-5"/>
                                    <span className="sr-only">Settings</span>
                                </a>
                            </TooltipTrigger>
                            <TooltipContent side="right">Settings</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4">
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
}

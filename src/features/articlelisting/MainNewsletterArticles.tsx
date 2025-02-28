import React, { useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { LogOut, Loader2 } from "lucide-react";
import { UserArticlesTable } from '../userarticlestable/UserArticlesTable';
import { useNewsletterConfig } from './hooks/useNewsletterConfig';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function MainNewsletterArticles() {
  const { user, signOut } = useAuthenticator();
  const { mainNewsletterUuid, loading, error } = useNewsletterConfig();
  const [selectedAge, setSelectedAge] = useState<number>(7); // Default to "1 week"
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  console.log("Logged in user:", user?.username);

  const handleSelectedArticlesChange = (articles: string[]) => {
    setSelectedArticles(articles);
    console.log("Selected articles:", articles);
  };

  return (
    <div className="space-y-4 min-w-[800px]">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="age-select" className="text-sm font-medium">
            Time Period:
          </label>
          <Select 
            onValueChange={(value) => setSelectedAge(Number(value))}
            defaultValue="7"
            value={selectedAge.toString()}
          >
            <SelectTrigger className="w-[180px]" id="age-select">
              <SelectValue placeholder="Select age filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="7">1 week</SelectItem>
              <SelectItem value="14">2 weeks</SelectItem>
              <SelectItem value="30">1 month</SelectItem>
              <SelectItem value="1000">Any</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          {selectedArticles.length > 0 && (
            <div className="text-sm">
              {selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''} selected
            </div>
          )}
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
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error.message}
        </div>
      ) : mainNewsletterUuid ? (
        <UserArticlesTable 
          newsletterUuid={mainNewsletterUuid} 
          age={selectedAge} 
          onSelectedArticlesChange={handleSelectedArticlesChange}
        />
      ) : (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-md">
          No main newsletter configuration found.
        </div>
      )}
    </div>
  );
} 
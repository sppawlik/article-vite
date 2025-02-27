import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { LogOut } from "lucide-react";
import { UserArticlesTable } from '../userarticlestable/UserArticlesTable';

interface ArticleListingProps {
  newsletterUuid: string;
}

export function ArticleListing({ newsletterUuid }: ArticleListingProps) {
  const { user, signOut } = useAuthenticator();

  console.log("Logged in user:", user?.username);

  return (
    <div className="space-y-4">
      <div className="flex justify-end p-4">
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
      
      <UserArticlesTable newsletterUuid={newsletterUuid} />
    </div>
  );
}

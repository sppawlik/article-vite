import React from 'react';
import { LogOut } from "lucide-react";
import { useAuthenticator } from '@aws-amplify/ui-react';

const LogoutButton = (): React.ReactElement => {
  const { signOut } = useAuthenticator();

  return (
    <div className="fixed top-2 right-2">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          signOut();
        }}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 bg-white/80 shadow-sm"
      >
        <LogOut className="h-5 w-5"/>
        <span className="sr-only">Logout</span>
      </a>
    </div>
  );
};

export default LogoutButton;

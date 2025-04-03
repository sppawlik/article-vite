import { Webchat, WebchatProvider, Fab, getClient } from "@botpress/webchat";
import React, { useState } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
const clientId = "64e235cd-cd9b-4470-aafa-b0ba36adac0a";

const Onboarding: React.FC = (): React.ReactElement => {
  const client = getClient({ clientId });
  const [isWebchatOpen, setIsWebchatOpen] = useState(true);
  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState);
  };
  const { user } = useAuthenticator();
  console.log(user?.signInDetails?.loginId);
  const configuration = {
    botName: "Customer Service",
    botAvatar: "", // Add your bot avatar URL here if needed
    composerPlaceholder: "Type your message...",
    themeColor: "#634433",
    themeName: "prism",
    botDescription:      "Hi! 👋  Welcome to webchat this is some description talking about what it is. This might be a bit longer when expanded.",
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <WebchatProvider
        client={client}
        configuration={configuration}
        userData={
          {
            user_name: user?.signInDetails?.loginId,
          }
        }
      >
        <div
          style={{
            display: isWebchatOpen ? "block" : "none",
          }}
        >
          <Webchat />
        </div>
      </WebchatProvider>
    </div>
  );
};

export default Onboarding;

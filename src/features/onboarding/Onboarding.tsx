import { Webchat, WebchatProvider, Fab, getClient } from "@botpress/webchat";
import React, { useState } from "react";

const clientId = '88b21852-2cfe-4bb3-bc01-b25ff873dd1d';

const Onboarding: React.FC = (): React.ReactElement => {
  const client = getClient({ clientId });
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);
  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState);
  };

  const configuration = {
    botName: "Customer Service",
    botAvatar: "", // Add your bot avatar URL here if needed
    composerPlaceholder: "Type your message...",
    themeColor: "#634433",
    themeName: "prism",
    // You can add more configuration options as needed
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <WebchatProvider
        client={client}
        configuration={configuration}
      >
        <Fab onClick={toggleWebchat} />
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

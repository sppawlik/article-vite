import { Webchat, WebchatProvider, useClient, Fab, getClient } from "@botpress/webchat";
import React, { useState, useEffect } from "react";
const clientId = "64e235cd-cd9b-4470-aafa-b0ba36adac0a";

interface OnboardingProps {
  newsletterUuid?: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ newsletterUuid }): React.ReactElement => {
  const client = getClient({ clientId });
  const [isWebchatOpen, setIsWebchatOpen] = useState(true);
  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState);
  };

  useEffect(() => {
    console.log("first mount");
  }, []); // Empty dependency array means this runs once on mount

  console.log(newsletterUuid);
  const configuration = {
    botName: "Onboarding Service",
    botAvatar: "", // Add your bot avatar URL here if needed
    composerPlaceholder: "Type your message...",
    themeColor: "#634433",
    themeName: "prism",
    botDescription:      "Hi! 👋  Welcome to webchat this is some description talking about what it is. This might be a bit longer when expanded.",
  };

  useEffect(() => {
    client.on('*', (event) => {
      if (event) {
        console.log("event")
        console.log(event)
      }
    })
  }, [])
  return (
    <div style={{ width: "90vw", height: "100vh" }}>
        <WebchatProvider 
        client={client}
        configuration={configuration}
        userData={
          {
            newsletter_uuid: newsletterUuid,
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


// return (
//   <div style={{ width: "90vw", height: "80vh", border: "1px solid red" }}>
//     <WebchatProvider
//       client={client}
//       configuration={configuration}
//       userData={
//         {
//           newsletter_uuid: newsletterUuid,
//         }
//       }
//     >
//       <h2 style={{ display: 'flex', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: '#666' }}>Coming Soon</h2>
//       <Container  style={{
//             height: "100%",
//             width: "100%",
//             display: "flex",
//             justifyContent: "space-between",
//           }}
//         >
//         <MessageList />
//         <Composer>
//         </Composer>
//       </Container>
//     </WebchatProvider>
//   </div>
// );
// };

// export default Onboarding;

/**
* const Botpress = () => {
const client = useClient({ clientId });

return (
  <WebchatProvider
    client={client}
    theme={theme}
    configuration={configuration}
  >
    <style>{style}</style>
    <Container
      style={{
        height: "100vh",
        width: "50%",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Header />
      <MessageList />
      <Composer>
        <ComposerInput />
        <ComposerButton />
      </Composer>
    </Container>
  </WebchatProvider>
);
};

export default Botpress;
*/
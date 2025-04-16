import {Webchat, WebchatProvider,  useClient, Fab, getClient, Container, MessageList, Composer, WebchatClient} from "@botpress/webchat";
import React, { useState, useEffect } from "react";
import {buildTheme} from "@botpress/webchat-generator";
// const { theme, style } = buildTheme({
//   themeName: "prism",
//   themeColor: "#634433",
// });

import './style.css';
import { theme } from './theme';

const clientId = "88b21852-2cfe-4bb3-bc01-b25ff873dd1d";

interface OnboardingProps {
  newsletterUuid: string;
  onRefreshNewsletter: () => Promise<void>;
}

const configuration = {
  botName: "Onboarding Service",
  botAvatar: "", // Add your bot avatar URL here if needed
  composerPlaceholder: "Type your message...",
};

const Onboarding: React.FC<OnboardingProps> = ({ newsletterUuid, onRefreshNewsletter }): React.ReactElement => {
  const [client, setClient] = useState<WebchatClient | null>(null);


  useEffect(() => {
    const client = getClient({ clientId })
    setClient(client)
    client.on('*', async (event) => {
      if (event) {
        if (event.type === "customEvent") {
          await onRefreshNewsletter();
        }
      }
    })
  }, [onRefreshNewsletter])
  if (!client) {
    return <div>Loading...</div>
  }
  return (
    <div style={{ width: "800px", height: "90vh", textAlign: "left" }}>
      <WebchatProvider
        client={client}
        configuration={configuration}
        userData={{
          newsletter_uuid: newsletterUuid,
        }}
        theme={theme}
      >
          <Webchat />
      </WebchatProvider>
    </div>
  );
};

export default Onboarding;

//
// return (
//   <div style={{ width: "800px", height: "80vh", textAlign: "left", border: "1px solid red" }}>
//     <WebchatProvider
//       client={client}
//       configuration={configuration}
//       userData={
//         {
//           newsletter_uuid: newsletterUuid,
//         }
//       }
//     >
//       <Container  style={{
//             height: "100%",
//             width: "100%",
//             display: "flex",
//             justifyContent: "left",
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
//
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
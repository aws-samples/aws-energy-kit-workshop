/************************************************************************
EnergyKit Dashboard

This dashboard will provide:
1. Summary data visualization
2. Links to external resources
3. Buttons to start/stop simulation
4. Visualization graphics for each turbine
5. Individual controls for each turbine
************************************************************************/

import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../common/components/Sidebar';
import TopNavigationHeader from '../../common/components/TopNavigationHeader';
import { Amplify, PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub';
import { CONNECTION_STATE_CHANGE, ConnectionState } from '@aws-amplify/pubsub';
import { Hub } from 'aws-amplify';

import {
  AppLayout,
  SideNavigation,
  Container,
  Header,
  HelpPanel,
  Grid,
  Box,
  TextContent,
  SpaceBetween,
  Flashbar,
  Alert,
  Form,
  Button,
  Table,
  Icon
} from '@cloudscape-design/components';

import { ExternalLinkItem } from '../../common/common-components-config';

import '../../common/styles/intro.scss';
import '../../common/styles/servicehomepage.scss';
import MqttMessenger from '../../components/mqtt-messenger/mqttMessenger';

// Create amplify pubsub
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: import.meta.env.VITE_REGION,
  aws_pubsub_endpoint: import.meta.env.VITE_IOT_ENDPOINT,
}));

console.log(import.meta.env.VITE_REGION)
console.log(import.meta.env.VITE_IOT_ENDPOINT)

// Subscribe to IoT Core topics
PubSub.subscribe([import.meta.env.VITE_IOT_PUB_TOPIC,import.meta.env.VITE_IOT_SUB_TOPIC]).subscribe({
  next: data => console.log('Message received', data),
  error: error => console.error(error),
  complete: () => console.log('Done'),
});

// Use hub to monitor the state of the mqtt connection
Hub.listen('pubsub', (data) => {
  const { payload } = data;
  if (payload.event === CONNECTION_STATE_CHANGE) {
    const connectionState = payload.data.connectionState;
    console.log(connectionState);
  }
});

// Publish a message to a topic
async function publishMqtt(topic, message) {
  await PubSub.publish(topic, { msg: message });
}

function clickTest() {
  alert("You clicked me!");
}


const ControlPanel = () => {
  return (
    <>
      <AppLayout
      navigation={<Sidebar activeHref="#/" />}
      content={<Content />}
      tools={<ToolsContent />}
      headerSelector='#h'
      disableContentPaddings={true}
    />
</>
  )
}

export default ControlPanel;


const Content = () => {
  return (
    <div>
    <TextContent>
      <div>
        <Grid className="custom-home__header" disableGutters={true}>
          <Box margin="xxl" padding={{ vertical: 'xl', horizontal: 'l' }}>
            <div className="custom-home__header-title">
              <Box fontSize="display-l" fontWeight="bold" color="inherit">
                Control Panel
              </Box>
            </div>
          </Box>
        </Grid>
      </div>

{/* Start How it works section */}
      <Box margin="xxl" padding="l">
        <SpaceBetween size="l">
          <div>
            <Container>
              <div>
              <h1>Send MQTT Messages</h1>
                  <p>Simulate turbine actions with the controls below</p>
                  <Button variant="primary" onClick={clickTest}>Test</Button>
                  <Button variant="primary" onClick={publishMqtt("Hello!")}>Hello</Button>
                  <Button variant="primary" onClick={publishMqtt("Content from the message box!")}>Send</Button>
              </div>
              <div>
              </div>
              <div>
                <Button variant="primary" onClick={publishMqtt("Content from the message box!")}>Send</Button>
              </div>
            </Container>
          </div>
        </SpaceBetween>
      </Box>
    </TextContent>
  </div>

  )
}

export const ToolsContent = () => (
  <HelpPanel
    header={<h2>EnergyKit Dashboard</h2>}
    footer={
      <>
        <h3>
          Learn more{' '}
          <span role="img" aria-label="Icon external Link">
            <Icon name="external" />
          </span>
        </h3>
        <ul>
        <li>
            <ExternalLinkItem
              href="https://aws.amazon.com/energy/"
              text="AWS Energy & Utilities"
            />
          </li>
          {}
        </ul>
      </>
    }
  >
    <p>
    Insert some help panel stuff here
    </p>
  </HelpPanel>
);


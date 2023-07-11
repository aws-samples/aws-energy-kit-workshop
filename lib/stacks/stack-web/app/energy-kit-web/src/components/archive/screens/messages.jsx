import  {Amplify, Auth } from 'aws-amplify'
import React, { useState, useRef } from "react"
import { PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';
import Textarea from "../../../front_end_library/@amzn/meridian/textarea"
import Row from "../../../front_end_library/@amzn/meridian/row"
import Column from "../../../front_end_library/@amzn/meridian/column"
import Heading from "../../../front_end_library/@amzn/meridian/heading"
import Text from "../../../front_end_library/@amzn/meridian/text"
import Button from "../../../front_end_library/@amzn/meridian/button"
import PageLayout from "../app/page-layout"
import Tooltip from "../../../front_end_library/@amzn/meridian/tooltip"
import Coachmark from "../../../front_end_library/@amzn/meridian/coachmark"
import Link from "../../../front_end_library/@amzn/meridian/link"
import Card from "../../../front_end_library/@amzn/meridian/card"
import Expander from "../../../front_end_library/@amzn/meridian/expander"
import ReactDOM from 'react-dom'
import { AmplifyConfig } from '../../config/amplify-config';

Amplify.configure(AmplifyConfig);


var SUB_TOPIC = AmplifyConfig.awsIotSubTopic;
var PUB_TOPIC = AmplifyConfig.awsIotPubTopic;

// Apply plugin with configuration
Amplify.addPluggable(new AWSIoTProvider({
  aws_pubsub_region: AmplifyConfig.awsRegion,
  aws_pubsub_endpoint: AmplifyConfig.awsPubSubEndpoint,
}));

/*
function addCardMessage(message){
  const cardMessage = (
    <Card width={300} spacingInset="none">
      <Column spacingInset="400">
        <Text>Message</Text>
          <Column spacingInset="400 none">
            <Text>{message}</Text>
          </Column>
      </Column>
    </Card>
  )
  return cardMessage
}

function prependData(data) {
  this.displayData.unshift();
  this.setState({
     showdata : this.displayData,
     postVal : ""
  });
}


async function ProcessMessage(payload) {
  console.log('Message received', payload);
  ReactDOM.render(
    prependData(payload),
    document.getElementById('incomingMsg')
  );
}
*/

async function SendMessage() {
  let payload = document.getElementById('msg').value;
  payload = payload.replace(/\r?\n|\r/g, "");
  payload = JSON.parse(payload)
  document.getElementById('msg').value='';
  PubSub.publish(PUB_TOPIC, payload);
  console.log('Message sent', payload)
}

function Messages() {
  //subscribe();
  const anchorNodeMQTT = useRef()
  const [textValue, setTextValue] = useState('{\n"simulate":1\n}')
  return (
    <PageLayout
      title={<React.Fragment>
        IoT Messaging
      </React.Fragment>}
    >
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="left">
      <Text ref={anchorNodeMQTT} type="b300">Send MQTT Messages to IoT Devices</Text>
      <Coachmark
        anchorNode={anchorNodeMQTT}
        popoverPosition="right"
        alignmentVertical="center"
        alignmentHorizontal="right"
      >
        <Column width="200px">
          <Text type="h100">Learn more about MQTT</Text>
          <Text>Visit the AWS IoT Core documentation... here</Text>
          <Link href="https://docs.aws.amazon.com/iot/latest/developerguide/view-mqtt-messages.html" target="_blank">AWS IoT</Link>
        </Column>
      </Coachmark>
      </Row>
      <Row width="80%" alignmentVertical="top" alignmentHorizontal="left">
      <Tooltip position="top" title="Enter your MQTT message here">
      <Textarea
        id="msg"
        name="msg"
        type="text"
        value={textValue}
        onChange={setTextValue}
        placeholder="Enter value..."
        size="large"
        rows={8}
        width="100%"
      />
      </Tooltip>
      </Row>
      <Row width="80%" alignmentVertical="top" alignmentHorizontal="right">
      <Tooltip position="right" title="Click here to send to IoT Core">
      <Button onClick={SendMessage}>
          Send
          </Button>
    </Tooltip>
          
          
        </Row>
        </Row>
        <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
        </Row>
          <Row id="incomingMsg" width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">

          </Row>
        </PageLayout>
        
  );
}
/*
function subscribe() {
  PubSub.subscribe(SUB_TOPIC).subscribe({
    ///next: data => ProcessMessage(data),
    error: error => console.error(error),
    close: () => console.log('Done'),
  });
}
*/

export default Messages;
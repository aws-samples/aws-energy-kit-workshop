/**
 * "Performance" page - currently a placeholder for things to come in the data
 * visualization space.
 */
 
import React, { useState, useRef, useCallback } from "react"
import Amplify, { Auth, API } from 'aws-amplify';
import ReactDOM from 'react-dom'
import Row from "../../../front_end_library/@amzn/meridian/row"
import Column from "../../../front_end_library/@amzn/meridian/column"
import Heading from "../../../front_end_library/@amzn/meridian/heading"
import Text from "../../../front_end_library/@amzn/meridian/text"
import Button from "../../../front_end_library/@amzn/meridian/button"
import PageLayout from "../app/page-layout"
import {TurbineTwinIconWhite} from '../animations/turbineTwinIconWhite'
import {TurbineTwinIconRed} from '../animations/turbineTwinIconRed'
import {TurbineTwinIconBlue} from '../animations/turbineTwinIconBlue'
import {TurbineTwinIconGreen} from '../animations/turbineTwinIconGreen'
import {TurbineTwinIconPurple} from '../animations/turbineTwinIconPurple'
import {TurbineTwinIconOrange} from '../animations/turbineTwinIconOrange'
import AssetDataPanel from "../app/assetDataPanel"
import TrackDataPipeline from "../actions/track-data-pipeline"
import Divider from "../../../front_end_library/@amzn/meridian/divider"
import ButtonGroup, { ButtonOption } from "../../../front_end_library/@amzn/meridian/button-group"
import Textarea from "../../../front_end_library/@amzn/meridian/textarea"
import { PubSub } from 'aws-amplify';
import Tooltip from "../../../front_end_library/@amzn/meridian/tooltip"
import Coachmark from "../../../front_end_library/@amzn/meridian/coachmark"
import Link from "../../../front_end_library/@amzn/meridian/link"
import Card from "../../../front_end_library/@amzn/meridian/card"
import Expander from "../../../front_end_library/@amzn/meridian/expander"

 const imageStyle = { display: "block", maxWidth: "100%" }

 const sensor_readings = [{
  "assetId": "Green Turbine",
  "temp": 14,
  "pressure": 23,
  "humidity": 13,
  "altitude": 223,
  "current": 14,
  "voltage": 17,
  "power": 12,
  "rpm": 20,
  "gearbox_vibration": 10,
  "generator_vibration": 12,
  "tower_vibration": 14,
  "status": "active",
  "color": "green",
  "timestamp": "11223344"
},
{
  "assetId": "Orange Turbine",
  "temp": 14,
  "pressure": 23,
  "humidity": 13,
  "altitude": 223,
  "current": 14,
  "voltage": 17,
  "power": 42,
  "rpm": 10,
  "gearbox_vibration": 10,
  "generator_vibration": 12,
  "tower_vibration": 14,
  "color": "orange",
  "status": "active",
  "timestamp": "11223344"
},
{
  "assetId": "Blue Turbine",
  "temp": 14,
  "pressure": 23,
  "humidity": 13,
  "altitude": 223,
  "current": 14,
  "voltage": 17,
  "power": 19,
  "rpm": 35,
  "gearbox_vibration": 10,
  "generator_vibration": 12,
  "tower_vibration": 14,
  "color": "blue",
  "status": "active",
  "timestamp": "11223344"
},
{
  "assetId": "Purple Turbine",
  "temp": 14,
  "pressure": 23,
  "humidity": 13,
  "altitude": 223,
  "current": 14,
  "voltage": 17,
  "power": 12,
  "rpm": 17,
  "gearbox_vibration": 10,
  "generator_vibration": 12,
  "tower_vibration": 14,
  "color": "purple",
  "status": "active",
  "timestamp": "11223344"
},
{
  "assetId": "White Turbine",
  "temp": 14,
  "pressure": 23,
  "humidity": 13,
  "altitude": 223,
  "current": 14,
  "voltage": 17,
  "power": 12,
  "rpm": 12,
  "gearbox_vibration": 10,
  "generator_vibration": 12,
  "tower_vibration": 14,
  "color": "white",
  "status": "active",
  "timestamp": "11223344"
}];

let assetList = sensor_readings.map((sensor_reading,index)=>{
  let turbine = <TurbineTwinIconWhite sensorValues={sensor_reading} />
  return (
       <Column
         type="outline"
         spacingInset="large"
         spacing="large"
         minWidth={200}
         maxWidth={300}
         heights={["fit", "fill"]} 
         alignmentHorizontal="center"
       >
           <Heading level={3} type="h200">
             {sensor_reading["assetId"]}
           </Heading>
           {turbine}
           <Divider />
           <Row widths={["fill", "fit"]} alignmentVertical="center" alignmentHorizontal="center">
           </Row>
       </Column>
  )
});

async function sendCommand(command) {
  //let payload=document.getElementById('msg').value;
  //document.getElementById('msg').value='';
  console.log(command);
  let simulate;
  let anomaly; 
  if (command === "on") {
    simulate = 1;
    anomaly = "False";
  } else if (command === "off"){
    simulate = 0;
    anomaly = "False";
  } else if (command === "off") {
    simulate = 1;
    anomaly = "True";
  } else {
    simulate = 0;
    anomaly = "False";
  }


  const payload = `{'simulate': ${simulate}, 'anomaly': ${anomaly}}`
  //await PubSub.publish(PUB_TOPIC, { msg: payload });
  //console.log('Message sent', payload)
  console.log("SENT!")
};

function Dashboard() {
  const [buttonValue, setButtonValue] = useState("off")
  const handleUpdateCommand = useCallback(buttonValue => sendCommand(buttonValue), [])
  const anchorNodeMQTT = useRef()
  const anchorNodeSendCommand = useRef()
  return (
    <PageLayout
      title={<React.Fragment>
        Live Dashboard
      </React.Fragment>}
    >
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
      <TrackDataPipeline />
      </Row>
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
        {assetList}
      </Row>
      
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
      <Text ref={anchorNodeSendCommand} type="b300">Send MQTT Messages to IoT Devices</Text>
      </Row>
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
        <ButtonGroup value={buttonValue} onChange={setButtonValue} onClick={sendCommand(buttonValue)}>
                <ButtonOption buttonValue="on">Run</ButtonOption>
                <ButtonOption buttonValue="anomaly">Anomaly</ButtonOption>
                <ButtonOption buttonValue="off">Off</ButtonOption>
        </ButtonGroup>
        <Coachmark
        anchorNode={anchorNodeSendCommand}
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
    </PageLayout>

  )
};

export default Dashboard


/**
 * "Performance" page - currently a placeholder for things to come in the data
 * visualization space.
 */

 import React, { useState } from "react"
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
})

 
 function Simulator() {
  const [buttonValue, setButtonValue] = useState()
  const [textValue, setTextValue] = useState("")
  return (

    <PageLayout
      title={<React.Fragment>
        Simulator Dashboard
      </React.Fragment>}
    >
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
      <TrackDataPipeline />
      </Row>
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
        {assetList}
      </Row>
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center" wrap="down">
      <ButtonGroup value={buttonValue} onChange={setButtonValue}>
              <ButtonOption buttonValue="on">Run</ButtonOption>
              <ButtonOption buttonValue="anomaly">Anomaly</ButtonOption>
              <ButtonOption buttonValue="off">Off</ButtonOption>
            </ButtonGroup>
      </Row>
      <Row width="100%" alignmentVertical="top" alignmentHorizontal="center">
      <Textarea
        id="my-input"
        value={textValue}
        onChange={setTextValue}
        placeholder="Enter a message here..."
        size="medium"
        rows={8}
        width="50%"
      />
      </Row>
      <Row width="75%" alignmentVertical="top" alignmentHorizontal="right">
      <Button>Send</Button>
      </Row>
      
      
    </PageLayout>

  )
}
 
 export default Simulator


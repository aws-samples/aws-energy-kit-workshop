/**
 * "Performance" page - currently a placeholder for things to come in the data
 * visualization space.
 */

 import React from "react"
 import Row from "../../../front_end_library/@amzn/meridian/row"
 import Column from "../../../front_end_library/@amzn/meridian/column"
 import Heading from "../../../front_end_library/@amzn/meridian/heading"
 import Text from "../../../front_end_library/@amzn/meridian/text"
import DataDashboardTile from "./data/dataDashboardTile"
import DataDashboardRainbowGuage from "./data/dataDashboardRainbowGuage"
import DataDashboardCircularGuage from "./data/dataDashboardCircularGuage"
import DataDashboardCircularGuageTickMarks from "./data/dataDashboardCircularGuageTickMarks"
import DataDashboardLineGraph from "./data/dataDashboardLineGraph"

 
 const imageStyle = { display: "block", maxWidth: "100%" }
 
 const AssetDataPanel = (props) => (
     <><Row widths={["fill", "fit"]} alignmentVertical="top">
         <Column alignmentHorizontal="center">
         <Row widths={["fill", "fit"]} alignmentVertical="center" alignmentHorizontal="center">
         <DataDashboardLineGraph />
           </Row>
         <Row widths={["fill", "fit"]} alignmentVertical="center" alignmentHorizontal="center">
         <DataDashboardTile value={props.sensorValues.power} units="KwH" data_title="Power" />
           </Row>
           <Row widths={["fill", "fit"]} alignmentVertical="center" alignmentHorizontal="center">
         <DataDashboardTile value={props.sensorValues.power} units="Hz" data_title="Vibration" />
           </Row>
           <Row widths={["fill", "fit"]} alignmentVertical="center" alignmentHorizontal="center">
           <DataDashboardRainbowGuage value={280} units="Temp" />
           <DataDashboardCircularGuageTickMarks value={props.sensorValues.rpm} units="RPM"/>
           </Row>
           <Row widths={["fill", "fit"]} alignmentVertical="center" alignmentHorizontal="center">
           <DataDashboardCircularGuage value={360} units="rpm"/>
           <DataDashboardCircularGuage value={360} units="rpm"/>
           </Row>

                     
                     
             </Column>
         </Row></>
 )
 
 export default AssetDataPanel
/**
 * The hero/splash shown at the top of the landing page. Spaceship included.
 */

 import React from "react"
 import { css } from "emotion"
 import { useHistory } from "react-router-dom"
 import { colorTeal500 } from "@amzn/meridian-tokens/base/color"
 import Column from "../../../front_end_library/@amzn/meridian/column"
 import Row from "../../../front_end_library/@amzn/meridian/row"
 import Text from "../../../front_end_library/@amzn/meridian/text"
 import Button from "../../../front_end_library/@amzn/meridian/button"
 import turbine3DImage from "../../assets/Turbine3D.jpg"
 
 const splashStyles = css({
   background: colorTeal500,
   // Push the blue background down with extra padding and then pull the next
   // section up over the extra blue background with negative margin.
   paddingBottom: 192,
   marginBottom: -160,
 })
 
 const Splash = () => {
   const history = useHistory()
   return (
     <Row
       className={splashStyles}
       spacing="large"
       alignmentHorizontal="center"
       widths={[530, "fill"]}
       wrap="down"
       spacingInset="xlarge xlarge none xlarge"
     >
       <img src={turbine3DImage} alt="Picture of turbines floating in sky scene." />
       <Column spacing="large" maxWidth={450}>
         <Text type="h100">From Edge to Insight</Text>
         <Text fontFamily="bookerly" type="d100">
           AWS Energy Asset Sandbox
         </Text>
         <Text fontFamily="bookerly" type="b400">
           Turbine Telemetry Demo is an architecture visualization and data exploration tool for near real-time energy asset monitoring using AWS IoT Greengrass, IoT Core, and AWS Amplify.
         </Text>
         <Row>
             <Button
               href="/live"
               onClick={history.push}
               backdropColor={colorTeal500}
             >
               Get Started
             </Button>
         </Row>
       </Column>
     </Row>
   )
 }
 
 export default Splash
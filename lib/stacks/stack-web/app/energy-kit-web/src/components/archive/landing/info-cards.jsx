/**
 * A row of cards shown on the landing page that include information about
 * Firefly's sweet sweet features.
 */

 import React from "react"
 import { useHistory } from "react-router-dom"
 import Row from "../../../front_end_library/@amzn/meridian/row"
 import Text from "../../../front_end_library/@amzn/meridian/text"
 import Button from "../../../front_end_library/@amzn/meridian/button"
 import Card, { CardHeader, CardActionBar } from "../../../front_end_library/@amzn/meridian/card"
 
 const cards = [
   {
     href: "/live",
     title: "Monitor Live",
     body:
       "Monitor live turbine data streamed through AWS IoT Greengrass and AWS IoT Core.",
     buttonLabel: "Live",
   },
   {
     href: "/simulator",
     title: "Simulate Data",
     body:
       "Simulate turbine data with live visualization and control panel.",
     buttonLabel: "Simulate",
   },
   {
     href: "/analytics",
     title: "Analyze Output",
     body:
       "Analyze turbine data with an interactive BI dashboard and tool.",
     buttonLabel: "Analytics",
   },
 ]
 
 const InfoCards = () => {
   const history = useHistory()
   return (
     <Row alignmentVertical="stretch" widths="fill" wrap="down">
       {cards.map(({ href, image, title, body, buttonLabel }, index) => (
         <Card
           key={title}
           imageSrc={image}
           imageSize="cover"
           imageViewportAspectRatio={15 / 13}
           href={href}
           onClick={history.push}
         >
           <CardHeader>
             <Text type="h400">{title}</Text>
           </CardHeader>
           <Text type="b300">{body}</Text>
           <CardActionBar widths="fill">
             <Button type="secondary" href={href} onClick={history.push}>
               {buttonLabel}
             </Button>
           </CardActionBar>
         </Card>
       ))}
     </Row>
   )
 }
 
 export default InfoCards
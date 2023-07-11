/**
 * "Performance" page - currently a placeholder for things to come in the data
 * visualization space.
 */

 import React from "react"
 import Row from "../../../front_end_library/@amzn/meridian/row"
 import Column from "../../../front_end_library/@amzn/meridian/column"
 import Heading from "../../../front_end_library/@amzn/meridian/heading"
 import Text from "../../../front_end_library/@amzn/meridian/text"
 import Button from "../../../front_end_library/@amzn/meridian/button"
 import PageLayout from "../app/page-layout"
 
 const imageStyle = { display: "block", maxWidth: "100%" }
 
 const CreateProfile = () => (
   <PageLayout
     title={
       <React.Fragment>
         Create Profile
       </React.Fragment>
     }
   >
     <Row widths={["fill", "fit"]} alignmentVertical="top">
       <Column alignmentHorizontal="left">
         <Heading level={2} type="d50">
           Data visualization
         </Heading>
         <Text>
           Currently set to launch late in 2020. Visit our roadmap on the
           Meridian site for more information regarding this upcoming milestone.
         </Text>
         <Button href="https://meridian.a2z.com/roadmap/?ref=Firefly">
           Meridian roadmap
         </Button>
       </Column>
       <Column
         type="outline"
         spacingInset="large"
         spacing="large"
         maxWidth={260}
       >
         <Column spacing="small">
           <Heading level={3} type="h200">
             Top shipments
           </Heading>
           <Text>Shipments to White Sun</Text>
         </Column>
         <Column spacing="small">
           <Heading level={3} type="h200">
             Top performer
           </Heading>
        
           <Text type="d50">Malcolm R</Text>
           <Text>Shadow / Murphy Galaxy</Text>
         </Column>
       </Column>
     </Row>
   </PageLayout>
 )
 
 export default CreateProfile
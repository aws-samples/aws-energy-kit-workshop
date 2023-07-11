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
 
 const DataBrowser = () => (
   <PageLayout
     title={
       <React.Fragment>
         Data Browser
       </React.Fragment>
     }
   >
     <Row widths={["fill", "fit"]} alignmentVertical="top">
       <Column alignmentHorizontal="left">
         <Heading level={2} type="d50">
           Work in Progress
         </Heading>
         <Text>
           Currenly set to launch as a prototype in 2022. The CarbonLake team is working on a quickstart. Review the feature roadmap below.
         </Text>
         <Button href="https://w.amazon.com/bin/view/Global_verticals_solutions_architecture/energy/resources/projects/carbon-data-solution/prototype-roadmap/">
           CarbonLake Roadmap
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
             Data Card
           </Heading>
           <Text>Example Data Subtitle</Text>
         </Column>
         <Column spacing="small">
           <Heading level={3} type="h200">
             Example Data Heading
           </Heading>
        
           <Text type="d50">Sample Data</Text>
           <Text>Some data here</Text>
         </Column>
       </Column>
     </Row>
   </PageLayout>
 )
 
 export default DataBrowser
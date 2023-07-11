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
import DataDashboardTile from "../app/data/dataDashboardTile"
import RainbowGauge from "../../../front_end_library/@amzn/meridian/rainbow-gauge"
import DataDashboardRainbowGuage from "../app/data/dataDashboardRainbowGuage"
import DataDashboardCircularGuage from "../app/data/dataDashboardCircularGuage"
 
 const imageStyle = { display: "block", maxWidth: "100%" }
 
 const Analytics = () => (
   <PageLayout
     title={
       <React.Fragment>
         Analytics
       </React.Fragment>
     }
   >
     <Row widths={["fill", "fit"]} alignmentVertical="top">
       <Column alignmentHorizontal="center">
         <Heading level={2} type="d50">
           Dashboard Sample
         </Heading>
         <Text>
           Currenly set to launch as a prototype in 2022. The CarbonLake team is working on a quickstart. CarbonLake will include analytics and visualizations from AWS Quicksight. Front-end libraries can also be used to access databases like in the example pictured below. Read more by visiting the CarbonLake roadmap below.
         </Text>
         <Button href="https://w.amazon.com/bin/view/Global_verticals_solutions_architecture/energy/resources/projects/carbon-data-solution/prototype-roadmap/">
           CarbonLake Roadmap
         </Button>
         
       </Column>
     </Row>
     <Row widths={["fill", "fit"]} alignmentVertical="top" alignmentHorizontal="center">
       <Column
         type="outline"
         spacingInset="large"
         spacing="large"
         maxWidth={400}
       >
         <Column spacing="small">
           <Heading level={3} type="h200">
             Data Card
           </Heading>
           <Text>Example Data Subtitle</Text>
           <DataDashboardTile />
         </Column>
         <Column spacing="small">
           <Heading level={3} type="h200">
             Example Data Heading
           </Heading>
           <Text>Some data here</Text>
         </Column>
       </Column>
       <Column
         type="outline"
         spacingInset="large"
         spacing="large"
         maxWidth={400}
       >
         <Column spacing="small">
           <Heading level={3} type="h200">
             Data Card
           </Heading>
           <Text>Example Data Subtitle</Text>
           <DataDashboardTile />
         </Column>
         <Column spacing="small">
           <Heading level={3} type="h200">
             Example Data Heading
           </Heading>
           <Text>Some data here</Text>
         </Column>
       </Column>
     </Row>
     <Row widths={["fill", "fit"]} alignmentVertical="center" alignmentHorizontal="center">
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
           <DataDashboardRainbowGuage />
         </Column>
         <Column spacing="small">
           <Heading level={3} type="h200">
             Example Data Heading
           </Heading>
           <Text>Some data here</Text>
         </Column>
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
           <DataDashboardCircularGuage />
         </Column>
         <Column spacing="small">
           <Heading level={3} type="h200">
             Example Data Heading
           </Heading>
           <Text>Some data here</Text>
         </Column>
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
           <DataDashboardCircularGuage />
         </Column>
         <Column spacing="small">
           <Heading level={3} type="h200">
             Example Data Heading
           </Heading>
           <Text>Some data here</Text>
         </Column>
       </Column>
     </Row>
   </PageLayout>
 )
 
 export default Analytics
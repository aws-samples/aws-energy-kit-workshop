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
 import UploadFile from "../actions/upload-file"
 import { Storage, StorageProvider } from 'aws-amplify';
import TrackDataPipeline from "../actions/track-data-pipeline"
 
 const imageStyle = { display: "block", maxWidth: "100%" }
 
 const Upload = () => (
   <PageLayout
     title={
       <React.Fragment>
         Upload
       </React.Fragment>
     }
   >
     <TrackDataPipeline />
     <Row widths={["fill", "fit"]} alignmentVertical="top">
       <Column alignmentHorizontal="left">
         <Heading level={2} type="d50">
           Upload Data
         </Heading>
         <Text>
           Upload data in any format. CarbonLake will utilize the AWS Carbon Data catalog and services and crawlers such as AWS Glue to map data schema and transform your raw data into defined schema.
         </Text>
         <UploadFile />
       </Column>
     </Row>
   </PageLayout>
 )
 
 export default Upload
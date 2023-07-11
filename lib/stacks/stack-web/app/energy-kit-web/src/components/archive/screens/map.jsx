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
import { createMap } from "maplibre-gl-js-amplify";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect } from 'react';
import  {Amplify, Auth } from 'aws-amplify'
import {withAuthenticator} from "@aws-amplify/ui-react"
import useAmplifyAuth from '../hooks/use-amplify-auth'
import { AmplifyConfig } from '../../config/amplify-config';

Amplify.configure(AmplifyConfig);
 
 const imageStyle = { display: "block", maxWidth: "100%" }
 
 const EmissionsMap = () => (

   <PageLayout
     title={
       <React.Fragment>
         Map
       </React.Fragment>
     }
   >
     <Row widths={["fill", "fit"]} alignmentVertical="top">
     </Row>
   </PageLayout>
 )
 
 export default EmissionsMap
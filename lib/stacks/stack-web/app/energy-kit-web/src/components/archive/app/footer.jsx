/**
 * The footer shown below the current page's content.
 */

 import React from "react"
 import { colorGray200 } from "@amzn/meridian-tokens/base/color"
 import Column from "../../../front_end_library/@amzn/meridian/column"
 import Row from "../../../front_end_library/@amzn/meridian/row"
 import Text from "../../../front_end_library/@amzn/meridian/text"
 import Link from "../../../front_end_library/@amzn/meridian/link"
 import builtWithMeridian from "../../assets/built-with-meridian.png"
 
 const footerStyle = {
   borderTop: `1px solid ${colorGray200}`,
 }
 
 const builtWithMeridianStyle = {
   height: 50,
   display: "block",
 }
 
 const Footer = () => (
   <div style={footerStyle}>
     <Column
       alignmentHorizontal="center"
       backgroundColor="alternateSecondary"
       spacingInset="medium large"
     >
       <Row alignmentHorizontal="center" width={950} maxWidth="100%">
         <Text>AWS Energy & Utilities Demo Use Only</Text>
       </Row>
     </Column>
   </div>
 )
 
 export default Footer
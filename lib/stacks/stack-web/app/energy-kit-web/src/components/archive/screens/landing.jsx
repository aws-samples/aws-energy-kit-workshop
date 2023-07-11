/**
 * The application landing page/home page.
 */

 import React from "react"
 import Heading from "../../../front_end_library/@amzn/meridian/heading"
 import Loader from "../../../front_end_library/@amzn/meridian/loader"
 import Column from "../../../front_end_library/@amzn/meridian/column"
 import Splash from "../landing/splash"
 import InfoCards from "../landing/info-cards"
 import PageLayout from "../app/page-layout"
 
 const Landing = () => {
   return (
     <React.Fragment>
       <Splash />
       <PageLayout spacing="xlarge">
         <InfoCards />
         <Column spacing="large">
           <Heading level={2} fontFamily="bookerly" type="d100">
             Recent Data
           </Heading>
             <Loader type="circular" />
         </Column>
       </PageLayout>
     </React.Fragment>
   )
 }
 
 export default Landing
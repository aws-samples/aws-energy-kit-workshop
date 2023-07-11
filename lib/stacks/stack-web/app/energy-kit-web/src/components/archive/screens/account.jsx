/**
 * "Account" page - Update your deets, choose your prefs.
 */

 import React, { useState } from "react"
 import Row from "../../../front_end_library/@amzn/meridian/row"
 import Tab, { TabGroup } from "../../../front_end_library/@amzn/meridian/tab"
 import PageLayout from "../app/page-layout"
 
 const Account = () => {
   const [currentTab, setCurrentTab] = useState("company-profile")
 
   return (
     <PageLayout
       title={
         <React.Fragment>
           Account
         </React.Fragment>
       }
     >
       <TabGroup value={currentTab} onChange={setCurrentTab}>
       <Tab value="company-profile">User profile</Tab>
         <Tab value="user-profile">Company profile</Tab>
         <Tab value="preferences">Preferences</Tab>
         <Tab value="data-standards">Data Standards</Tab>
       </TabGroup>
       <Row width="100%" widths="100%">
         {currentTab === "company-profile"}
       </Row>
     </PageLayout>
   )
 }
 
 export default Account
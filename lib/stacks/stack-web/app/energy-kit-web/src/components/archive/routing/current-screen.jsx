/**
 * A component that uses react-router to render the current application screen
 * based on the URL.
 */

 import React from "react"
 import { Switch, Route, useLocation } from "react-router-dom"
 // Screens
 import Landing from "../screens/landing"
 import Account from "../screens/account"
 import Analytics from "../screens/analytics"
 import Dashboard from "../screens/dashboard"
 import DataBrowser from "../screens/data-browser"
 import Settings from "../screens/settings"
 import Notifications from "../screens/notifications"
 import CreateProfile from "../screens/create-profile"
 import Documentation from "../screens/documentation"
import EmissionsMap from "../screens/map"
import Timeline from "../screens/simulator"
import Insights from "../screens/insights"
import Upload from "../screens/upload"
import Messages from "../screens/messages"
import Simulator from "../screens/simulator"
 
 const CurrentScreen = () => {
   return (
     <Switch>
       <Route path="/account">
         <Account />
       </Route>
       <Route path="/analytics">
         <Analytics />
       </Route>
       <Route path="/live">
         <Dashboard />
       </Route>
       <Route path="/account/create-profile">
         <CreateProfile />
       </Route>
       <Route path="/account">
         <Account />
       </Route>
       <Route path="/data-browser">
         <DataBrowser />
       </Route>
       <Route path="/messages">
         <Messages />
       </Route>
       <Route path="/notifications">
         <Notifications />
       </Route>
       <Route path="/settings">
         <Settings />
       </Route>
       <Route path="/documentation">
         <Documentation />
       </Route>
       <Route path="/emissions-map">
         <EmissionsMap />
       </Route>
       <Route path="/simulator">
         <Simulator />
       </Route>
       <Route path="/insights">
         <Insights />
       </Route>
       <Route path="/upload">
         <Upload />
       </Route>
       <Route path="/">
         <Landing />
       </Route>
     </Switch>
   )
 }
 
 export default CurrentScreen
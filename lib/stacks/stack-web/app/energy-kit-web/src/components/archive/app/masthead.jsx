/**
 * The navigation bar across the top of the application.
 */

 import React, { useCallback } from "react"
 import { useHistory } from "react-router-dom"
 import Masthead, {
   MastheadTitle,
   MastheadMenuButton,
 } from "../../../front_end_library/@amzn/meridian/masthead"
 import Button from "../../../front_end_library/@amzn/meridian/button"
 import Text from "../../../front_end_library/@amzn/meridian/text"
 import Icon from "../../../front_end_library/@amzn/meridian/icon"
 import userTokens from "@amzn/meridian-tokens/base/icon/user"
 import useSideMenuOpen from "../hooks/use-side-menu-open"
import Searchbar from "./searchbar"
import DarkModeToggle from "./darkmodeToggle"
 
 const AppMasthead = () => {
   const history = useHistory()
   const [sideMenuOpen, setSideMenuOpen] = useSideMenuOpen()
 
   const onClickMenuButton = useCallback(() => setSideMenuOpen(!sideMenuOpen), [
     sideMenuOpen,
     setSideMenuOpen,
   ])
 
   return (
     <Masthead>
       <MastheadMenuButton onClick={onClickMenuButton} />
       <MastheadTitle href="/" onClick={history.push}>
         <Text fontFamily="bookerly" type="b500">
           AWS IoT EnergyKit
         </Text>
       </MastheadTitle>
       <DarkModeToggle />
       <Button type="icon" href="/account" size="small" onClick={history.push}>
         <Icon tokens={userTokens}>Account</Icon>
       </Button>
       <Searchbar />
     </Masthead>
   )
 }
 
 export default AppMasthead
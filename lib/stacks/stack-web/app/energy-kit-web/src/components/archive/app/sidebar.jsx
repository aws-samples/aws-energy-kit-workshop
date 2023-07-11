/**
 * The side navigation for the application.
 */

 import React, { useEffect, useCallback } from "react"
 import { useHistory, useLocation } from "react-router-dom"
 import SideMenu, { SideMenuLink } from "../../../front_end_library/@amzn/meridian/side-menu"
 import Icon from "../../../front_end_library/@amzn/meridian/icon"
 import Theme from "../../../front_end_library/@amzn/meridian/theme"
 import Row from "../../../front_end_library/@amzn/meridian/row"
 import Column from "../../../front_end_library/@amzn/meridian/column"
 import Button from "../../../front_end_library/@amzn/meridian/button"
 import calendarTokens from "@amzn/meridian-tokens/base/icon/calendar"
 import trainingTokens from "@amzn/meridian-tokens/base/icon/training"
 import metricsTokens from "@amzn/meridian-tokens/base/icon/metrics"
 import geopinTokens from "@amzn/meridian-tokens/base/icon/geopin"
 import dashboardTokens from "@amzn/meridian-tokens/base/icon/dashboard"
 import bulbTokens from "@amzn/meridian-tokens/base/icon/bulb"
 import cogTokens from "@amzn/meridian-tokens/base/icon/cog"
 import viewTokens from "@amzn/meridian-tokens/base/icon/view"
 import chatTokens from "@amzn/meridian-tokens/base/icon/chat"
 import uploadLargeTokens from "@amzn/meridian-tokens/base/icon/upload-large"
 import orangeLightTokens from "@amzn/meridian-tokens/theme/orange-light"
 import useBreakpoint from "../../../front_end_library/@amzn/meridian/_use-breakpoint"
 import useSideMenuOpen from "../hooks/use-side-menu-open"
 
 const paths = [
    { title: "Live", href: "/live", iconTokens: dashboardTokens },
    { title: "Simulator", href: "/simulator", iconTokens: trainingTokens },
     { title: "Analytics", href: "/analytics", iconTokens: metricsTokens },
     { title: "Insights", href: "/insights", iconTokens: bulbTokens },
     { title: "Messaging", href: "/messages", iconTokens: chatTokens },
     { title: "Map", href: "/emissions-map", iconTokens: geopinTokens },
     { title: "Data Browser", href: "/data-browser", iconTokens: viewTokens },
     { title: "Settings", href: "/settings", iconTokens: cogTokens },
 ]
 
 const androidIcon = {
   // eslint-disable-next-line import/no-webpack-loader-syntax
   iconAndroidData: require("!svg-inline-loader?removeSVGTagAttrs=false!../../assets/android-icon.svg"),
   iconAndroidWidth: 24,
   iconAndroidHeight: 24,
 }
 
 const appleIcon = {
   // eslint-disable-next-line import/no-webpack-loader-syntax
   iconData: require("!svg-inline-loader?removeSVGTagAttrs=false!../../assets/apple-icon.svg"),
   iconWidth: 24,
   iconHeight: 24,
 }
 
 const SideBar = () => {
   const history = useHistory()
   const location = useLocation()
   const [open, setOpen] = useSideMenuOpen()
   const [, rootPath] = location.pathname.split("/")
   const breakpointState = useBreakpoint("600px")
   const mobile = breakpointState === "smaller"
 
   const onMobileClose = useCallback(() => {
     setOpen(false)
   }, [setOpen])
 
   // When the browser resizes from desktop -> mobile, close the side menu
   // and vicaversa
   useEffect(() => {
     setOpen(!mobile)
   }, [mobile, setOpen])
 
   // On mobile, clicking on a link will close the menu
   const onClickLink = useCallback(
     href => {
       history.push(href)
       if (mobile) setOpen(false)
     },
     [mobile, history, setOpen]
   )
 
   return (
     <SideMenu
       open={open}
       type={mobile ? "overlay" : "skinny"}
       width="220px"
       onClose={mobile ? onMobileClose : undefined}
     >
       {paths.map(({ title, href, iconTokens }) => (
         <SideMenuLink
           key={href}
           href={href}
           onClick={onClickLink}
           collapsedIcon={iconTokens}
           selected={`/${rootPath}` === href}
         >
           <Row spacing="small">
             <Icon tokens={iconTokens} />
             <span>{title}</span>
           </Row>
         </SideMenuLink>
       ))}
       <Column>
         <Theme tokens={orangeLightTokens}>
           <Column alignmentHorizontal="left">
           </Column>
         </Theme>
         <Button
           type="secondary"
           href="https://meridian.a2z.com/firefly/?ref=Firefly&platform=android"
           target="_blank"
           rel="noopener noreferrer"
         >
           <Icon tokens={androidIcon}>Android icon</Icon>
           Android
         </Button>
         <Button
           type="secondary"
           href="https://meridian.a2z.com/firefly/?ref=Firefly&platform=ios"
           target="_blank"
           rel="noopener noreferrer"
         >
           <Icon tokens={appleIcon}>Apple icon</Icon>
           iOS
         </Button>
       </Column>
     </SideMenu>
   )
 }
 
 export default SideBar
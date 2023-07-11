import React from "react"
import { BrowserRouter, HashRouter } from "react-router-dom"

const Router = ({ children, ...props }) =>
  React.createElement(
    process.env.REACT_APP_HASH_ROUTING ? HashRouter : BrowserRouter,
    props,
    children
  )

export default Router
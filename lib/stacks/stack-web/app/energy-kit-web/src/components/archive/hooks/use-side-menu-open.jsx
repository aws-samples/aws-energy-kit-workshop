/**
 * A context-based hook that allows components to determine whether the
 * application side menu is open or closed. The API is the same as useContext.
 */

 import React from "react";
 import {useState, useContext, createContext} from 'react';
 
  const SideMenuOpenContext = createContext()
  
  const SideMenuOpenContextProvider = ({ children }) => {
    const state = useState(true)
    return (
      <SideMenuOpenContext.Provider value={state}>
        {children}
      </SideMenuOpenContext.Provider>
    )
  }
  
  const useSideMenuOpen = () => useContext(SideMenuOpenContext)
  
  export { SideMenuOpenContextProvider }
  export default useSideMenuOpen
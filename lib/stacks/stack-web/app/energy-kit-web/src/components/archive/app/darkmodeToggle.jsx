import React, { useState } from "react"
import Toggle from "../../../front_end_library/@amzn/meridian/toggle"
import Icon from "../../../front_end_library/@amzn/meridian/icon"
import asleepTokens from "@amzn/meridian-tokens/base/icon/asleep"

const DarkModeToggle = () => {
  const [checked, setChecked] = useState(false)
  return (
    <Toggle checked={checked} onChange={setChecked}>
        <Icon tokens={asleepTokens}>Dark Mode</Icon>
    </Toggle>
    
  )

}

export default DarkModeToggle;
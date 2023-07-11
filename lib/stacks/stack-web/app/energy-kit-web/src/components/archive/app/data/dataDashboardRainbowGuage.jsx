import React, { useState } from "react"
import RainbowGauge from "../../../../front_end_library/@amzn/meridian/rainbow-gauge"
import Column from "../../../../front_end_library/@amzn/meridian/column"
import Row from "../../../../front_end_library/@amzn/meridian/row"

const DataDashboardRainbowGuage = (props) => {
    const [value, setValue] = useState(props.value)
  return (
    <Column height="100%" heights={["fill"]} alignmentHorizontal="center">
      <Row alignmentVertical="center">
        <RainbowGauge
          value={value}
          minValue={100}
          maxValue={500}
          needle={true}
          width={120}
        />
      </Row>
    </Column>
  )
}

export default DataDashboardRainbowGuage;
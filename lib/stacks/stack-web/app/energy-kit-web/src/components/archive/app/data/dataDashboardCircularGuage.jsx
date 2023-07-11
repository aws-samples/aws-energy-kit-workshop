import React, { useState } from "react"
import CircularGauge from "../../../../front_end_library/@amzn/meridian/circular-gauge"
import Column from "../../../../front_end_library/@amzn/meridian/column"
import Row from "../../../../front_end_library/@amzn/meridian/row"
import Text from "../../../../front_end_library/@amzn/meridian/text"

const DataDashboardCircularGuage = (props) => {
  const [value, setValue] = useState(props.value)
  return (
    <Column height="100%" heights={["fill"]} alignmentHorizontal="center">
      <Row alignmentVertical="center">
        <CircularGauge value={value} minValue={0} maxValue={100} open={true} width={120}>
          <Text type="d40">
            <strong>{props.value} {props.units}</strong>
          </Text>
        </CircularGauge>
      </Row>
    </Column>
    
  )
}

export default DataDashboardCircularGuage;
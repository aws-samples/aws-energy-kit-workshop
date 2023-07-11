import React, { useState } from "react"
import CircularGauge from "../../../../front_end_library/@amzn/meridian/circular-gauge"
import Column from "../../../../front_end_library/@amzn/meridian/column"
import Row from "../../../../front_end_library/@amzn/meridian/row"
import Text from "../../../../front_end_library/@amzn/meridian/text"

const DataDashboardCircularGuageTickMarks = (props) => {
  const [value, setValue] = useState(props.value)
  return (
    <Row alignmentHorizontal="center" spacing="500">
    <CircularGauge
      value={props.value}
      minValue={0}
      maxValue={120}
      open={true}
      needle={true}
      divisions={1}
      width={120}
    />
  </Row>
  )
}

export default DataDashboardCircularGuageTickMarks;
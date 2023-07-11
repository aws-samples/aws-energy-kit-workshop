import React, { useCallback } from "react"
import Tile from "../../../../front_end_library/@amzn/meridian/tile"
import Heading from "../../../../front_end_library/@amzn/meridian/heading"
import Metric from "../../../../front_end_library/@amzn/meridian/metric"
import Row from "../../../../front_end_library/@amzn/meridian/row"
import Sparkline from "../../../../front_end_library/@amzn/meridian/sparkline"
import TrendText from "../../../../front_end_library/@amzn/meridian/trend-text"
//import getEnergyConsumption from "./get-energy-consumption"

const energy_data = [
    [0, 5],
    [1, 7],
    [2, 9],
    [3, 10],
    [4, 15],
    [5, 3],
    [6, 2],
    [7, 1.5],
  ]

const DataDashboardTile = (props) => {
  //const energyConsumption = getEnergyConsumption()
  const onClick = useCallback(() => {}, [])
  return (
    <Tile onClick={onClick} spacingInset="300" width={400}>
      <Row width={250}>
        <Sparkline
          data={[{ value: energy_data }]}
          width={120}
          height={60}
        />
        <div>
          <Heading level={2} type="h200" color="secondary">
            {props.data_title}
          </Heading>
          <Metric
            units={props.units}
            numberFormat={{ maximumSignificantDigits: 3, notation: "compact" }}
            size="small"
          >
            {props.value}
          </Metric>
          <TrendText
            numberFormat={{ sign: "exceptZero", style: "percent" }}
            arrow="up"
            color="positive"
          >
            {0.5}
          </TrendText>
        </div>
      </Row>
    </Tile>
  )
}

export default DataDashboardTile
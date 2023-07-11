import * as React from "react";
import {
  Button, Box, BarChart
} from "@cloudscape-design/components"


const DataPanel = (props) => {
  <BarChart
      series={[
        {
          title: "Site 1",
          type: "bar",
          data: [
            { x: new Date(1601092800000), y: 34503 },
            { x: new Date(1601100000000), y: 25832 },
            { x: new Date(1601107200000), y: 4012 },
            { x: new Date(1601114400000), y: -5602 },
            { x: new Date(1601121600000), y: 17839 }
          ],
          valueFormatter: e =>
            "$" + e.toLocaleString("en-US")
        },
        {
          title: "Average revenue",
          type: "threshold",
          y: 19104,
          valueFormatter: e =>
            "$" + e.toLocaleString("en-US")
        }
      ]}
      xDomain={[
        new Date(1601092800000),
        new Date(1601100000000),
        new Date(1601107200000),
        new Date(1601114400000),
        new Date(1601121600000)
      ]}
      yDomain={[-10000, 40000]}
      i18nStrings={{
        filterLabel: "Filter displayed data",
        filterPlaceholder: "Filter data",
        filterSelectedAriaLabel: "selected",
        legendAriaLabel: "Legend",
        chartAriaRoleDescription: "line chart",
        xTickFormatter: e =>
          e
            .toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: !1
            })
            .split(",")
            .join("\n"),
        yTickFormatter: undefined
      }}
      ariaLabel="Single data series line chart"
      errorText="Error loading data."
      height={300}
      loadingText="Loading chart"
      recoveryText="Retry"
      xScaleType="categorical"
      xTitle="Time (UTC)"
      yTitle="Revenue (USD)"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No data available</b>
          <Box variant="p" color="inherit">
            There is no data available
          </Box>
        </Box>
      }
      noMatch={
        <Box textAlign="center" color="inherit">
          <b>No matching data</b>
          <Box variant="p" color="inherit">
            There is no matching data to display
          </Box>
          <Button>Clear filter</Button>
        </Box>
      }
    />

}
  
export default DataPanel;
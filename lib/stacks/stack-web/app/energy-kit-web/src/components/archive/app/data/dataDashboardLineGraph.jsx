import React from "react"
import {
  VictoryChart,
  VictoryVoronoiContainer,
  VictoryAxis,
  VictoryLine,
} from "victory"
import Legend, { LegendProvider } from "../../../../front_end_library/@amzn/meridian/legend"
import Heading from "../../../../front_end_library/@amzn/meridian/heading"
import Column from "../../../../front_end_library/@amzn/meridian/column"
import victoryLinePlugin from "../../../../front_end_library/@amzn/meridian/legend/plugin/victory-line"
import victoryTooltipPlugin from "../../../../front_end_library/@amzn/meridian/legend/plugin/victory-tooltip"
import useVictoryTheme from "../../../../front_end_library/@amzn/meridian/use-victory-theme"

const DataDashboardLineGraph = (props) => {
  const theme = useVictoryTheme({ showIndependentGrid: false })
  return (
    <LegendProvider
      data={datasets}
      plugins={[
        // This plugin connects the lines in the chart with the Meridian Legend
        // for features like highlighting the lines when a legend item is
        // hovered or focused. The theme used for the Victory chart must be
        // provided via the `theme` plugin option.
        victoryLinePlugin({ theme }),
        // This plugin enables mouse, keyboard, and screen-reader accessible
        // tooltips to the chart to ensure that all users have access to the
        // data presented. The showCrosshair option is helpful for line charts
        // to help connect tooltips to the points that they reference.
        victoryTooltipPlugin({ showCrosshair: true }),
      ]}
      aria-label={
        // Providing this extra context is key for screen-reader users to
        // understand what they're interacting with. Meridian will handle all
        // the behind-the-scene connections to make sure this label is read when
        // appropriate.
        "Line chart graphing the number of animals per year"
      }
    >
      {(
        // The fields in this object are determined by the plugins supplied to
        // LegendProvider.
        {
          // When called with the key for a particular legend item (e.g. "dogs"
          // in the `datasets` array passed to `LegendProvider.data`) this
          // function returns an object of props that should be applied to the
          // VictoryLine component associated with that legend item.
          getLineProps,
          // This object contains props that should be applied to the
          // VictoryVoronoiContainer (the recommended chart container to use
          // when integrating Meridian with Victory). This is key for enabling
          // the chart's hover interactions and connecting a few accessibility
          // props.
          voronoiContainerProps,
          // This is a Meridian-styled tooltip that should be passed to the
          // `labelComponent` prop of each `VictoryLine`. The `legendKey` prop
          // must be set to the key of the legend item that the `VictoryLine` is
          // associated with. An optional `ariaLabels` prop can be set to a
          // function to generate separate labels for screen readers (if extra
          // context needs to be supplied to screen readers). This tooltip is
          // important for keyboard and screen-reader accessibility.
          Tooltip,
        }
      ) => (
        <Column spacing="none" maxWidth={600}>
          {
            // IMPORTANT: See the official Victory documentation for help with
            // any of the Victory components used below:
            // https://formidable.com/open-source/victory/docs/
          }
          <VictoryChart
            theme={theme}
            width={600}
            height={260}
            // Be sure to use a unique name for each chart on the page as
            // Victory uses it to create the `id`s for low level elements.
            name="line-chart-basic"
            containerComponent={
              <VictoryVoronoiContainer
                labels={formatLabel}
                {
                  // Use the "spread" syntax to automatically apply all the
                  // props in this object to the `VictoryVoronoiContainer`
                  // component.
                  ...voronoiContainerProps
                }
              />
            }
          >
            {
              // Meridian recommends rendering the chart axis behind the lines,
              // which can be accomplished by rendering them first in the order
              // of elements.
            }
            <VictoryAxis />
            <VictoryAxis
              dependentAxis
              tickFormat={(value, index) => (index > 0 ? value : "")}
            />
            {datasets.map(({ data, key }) => (
              <VictoryLine
                key={key}
                data={data}
                x="year"
                y="value"
                labels={formatLabel}
                labelComponent={
                  <Tooltip
                    legendKey={key}
                    ariaLabels={
                      // If the labels provided to the `VictoryLine` component's
                      // `labels` prop above do not include enough context for
                      // someone who cannot see the chart, then provide more
                      // detailed labels via this function. Otherwise you can
                      // omit the `ariaLabels` prop.
                      props => `${formatLabel(props)}, ${props.datum.year}`
                    }
                  />
                }
                {
                  // Use the "spread" syntax to automatically apply all the
                  // props returned from this function to the `VictoryLine`
                  // component.
                  ...getLineProps(key)
                }
              />
            ))}
          </VictoryChart>
          <Legend direction="horizontal" />
        </Column>
      )}
    </LegendProvider>
  )
}

const formatLabel = ({ datum }) => datum.value

const datasets = [
  {
    key: "rpm",
    label: "RPM",
    data: [
      { year: "2010", value: 5 },
      { year: "2011", value: 2 },
      { year: "2012", value: 4 },
      { year: "2013", value: 3 },
      { year: "2014", value: 4 },
      { year: "2015", value: 1 },
    ],
  },
  {
    key: "vibration",
    label: "Vibration",
    data: [
      { year: "2010", value: 2 },
      { year: "2011", value: 6 },
      { year: "2012", value: 1 },
      { year: "2013", value: 2 },
      { year: "2014", value: 2 },
      { year: "2015", value: 4 },
    ],
  },
  {
    key: "power",
    label: "Power",
    data: [
      { year: "2010", value: 2 },
      { year: "2011", value: 5 },
      { year: "2012", value: 4 },
      { year: "2013", value: 5 },
      { year: "2014", value: 3 },
      { year: "2015", value: 6 },
    ],
  },
]

export default DataDashboardLineGraph;


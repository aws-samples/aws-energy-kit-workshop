type Config = {
  datasourceId: string;
  assetName: string;
  dashboardType: string;
};

export default (config: Config) => ({
  dashboard: {
    annotations: {
      list: [
        {
          builtIn: 1,
          datasource: "-- Grafana --",
          enable: true,
          hide: true,
          iconColor: "rgba(0, 211, 255, 1)",
          name: "Annotations & Alerts",
          target: {
            limit: 100,
            matchAny: false,
            tags: [],
            type: "dashboard"
          },
          type: "dashboard"
        }
      ]
    },
    description: "",
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 0,
    iteration: 1667842267796,
    links: [],
    liveNow: false,
    panels: [
      {
        gridPos: {
          h: 18,
          w: 17,
          x: 0,
          y: 0
        },
        id: 6,
        options: {
          customSelCompVarName: "${sel_comp}",
          customSelEntityVarName: "sel_entity",
          datasource: "1",
          sceneId: "summaryView"
        },
        targets: [
          {
            componentName: "turbineSitewiseTelemetry",
            datasource: {
              type: "grafana-iot-twinmaker-datasource",
              id: config.datasourceId
            },
            entityId: "",
            properties: [
              "temp",
              "vibration",
              "rpm"
            ],
            queryType: "EntityHistory",
            refId: "A"
          },
          {
            componentName: "turbineSitewiseTelemetry",
            datasource: {
              type: "grafana-iot-twinmaker-datasource",
              id: config.datasourceId
            },
            entityId: "",
            hide: false,
            properties: [
              "temp",
              "vibration",
              "rpm"
            ],
            queryType: "EntityHistory",
            refId: "B"
          },
          {
            componentName: "turbineSitewiseTelemetry",
            datasource: {
              type: 'grafana-iot-twinmaker-datasource',
              id: config.datasourceId
            },
            entityId: "",
            hide: false,
            properties: [
              "rpm",
              "temp",
              "vibration"
            ],
            queryType: "EntityHistory",
            refId: "C"
          },
          {
            datasource: {
              type: "grafana-iot-twinmaker-datasource",
              id: config.datasourceId
            },
            filter: [
              {
                name: "alarm_status",
                op: "=",
                value: "ACTIVE"
              }
            ],
            hide: false,
            queryType: "GetAlarms",
            refId: "D"
          }
        ],
        title: "Summary View",
        type: "grafana-iot-twinmaker-sceneviewer-panel"
      },
      {
        gridPos: {
          h: 18,
          w: 7,
          x: 17,
          y: 0
        },
        id: 41,
        options: {
          datasource: "1",
          sceneId: "topView"
        },
        pluginVersion: "8.4.7",
        targets: [
          {
            componentName: "turbineSitewiseTelemetry",
            datasource: {
              type: "grafana-iot-twinmaker-datasource",
              id: config.datasourceId
            },
            entityId: "",
            hide: false,
            properties: [
              "rpm",
              "temp",
              "vibration"
            ],
            queryType: "EntityHistory",
            refId: "A"
          }
        ],
        title: "Top View",
        transformations: [
          {
            id: "twinmaker-register-links",
            options: {
              addSelectionField: false,
              vars: [
                {
                  fieldName: "entityName",
                  name: "${sel_entity_name}"
                },
                {
                  fieldName: "entityId",
                  name: "${sel_entity}"
                },
                {
                  fieldName: "alarmName",
                  name: "${sel_comp}"
                }
              ]
            }
          }
        ],
        type: "grafana-iot-twinmaker-sceneviewer-panel"
      },
      {
        fieldConfig: {
          defaults: {
            color: {
              mode: "continuous-BlPu"
            },
            displayName: "Rotation",
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "red",
                  value: 80
                }
              ]
            },
            unit: "rotrpm"
          },
          overrides: []
        },
        gridPos: {
          h: 11,
          w: 6,
          x: 0,
          y: 18
        },
        id: 58,
        options: {
          orientation: "auto",
          reduceOptions: {
            calcs: [
              "lastNotNull"
            ],
            fields: "",
            values: false
          },
          showThresholdLabels: false,
          showThresholdMarkers: true
        },
        pluginVersion: "8.4.7",
        targets: [
          {
            componentName: "turbineSitewiseTelemetry",
            datasource: {
              type: 'grafana-iot-twinmaker-datasource',
              id: config.datasourceId
            },
            entityId: "",
            hide: false,
            properties: [
              "rpm"
            ],
            queryType: "EntityHistory",
            refId: "B"
          }
        ],
        title: "RPM",
        type: "gauge"
      },
      {
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            displayName: "Vibration",
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "red",
                  value: 80
                }
              ]
            },
            unit: "accMS2"
          },
          overrides: []
        },
        gridPos: {
          h: 11,
          w: 6,
          x: 6,
          y: 18
        },
        id: 60,
        options: {
          orientation: "auto",
          reduceOptions: {
            calcs: [
              "lastNotNull"
            ],
            fields: "",
            values: false
          },
          showThresholdLabels: false,
          showThresholdMarkers: true
        },
        pluginVersion: "8.4.7",
        targets: [
          {
            componentName: "turbineSitewiseTelemetry",
            datasource: {
              type: 'grafana-iot-twinmaker-datasource',
              id: config.datasourceId
            },
            entityId: "",
            properties: [
              "vibration"
            ],
            queryType: "EntityHistory",
            refId: "A"
          }
        ],
        title: "Vibration",
        type: "gauge"
      },
      {
        fieldConfig: {
          defaults: {
            color: {
              mode: "continuous-BlYlRd"
            },
            displayName: "Temperature",
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "red",
                  value: 80
                }
              ]
            },
            unit: "fahrenheit"
          },
          overrides: []
        },
        gridPos: {
          h: 11,
          w: 5,
          x: 12,
          y: 18
        },
        id: 62,
        options: {
          orientation: "auto",
          reduceOptions: {
            calcs: [
              "lastNotNull"
            ],
            fields: "",
            values: false
          },
          showThresholdLabels: false,
          showThresholdMarkers: true
        },
        pluginVersion: "8.4.7",
        targets: [
          {
            componentName: "turbineSitewiseTelemetry",
            datasource: {
              type: 'grafana-iot-twinmaker-datasource',
              id: config.datasourceId
            },
            entityId: "",
            properties: [
              "temp"
            ],
            queryType: "EntityHistory",
            refId: "A"
          }
        ],
        title: "Temp",
        type: "gauge"
      },
      {
        gridPos: {
          h: 11,
          w: 7,
          x: 17,
          y: 18
        },
        id: 64,
        options: {
          datasource: "",
          sceneId: "driveSystemView"
        },
        targets: [
          {
            componentName: "turbineSitewiseTelemetry",
            datasource: {
              type: 'grafana-iot-twinmaker-datasource',
              id: config.datasourceId
            },
            entityId: "",
            hide: false,
            properties: [
              "rpm",
              "temp",
              "vibration"
            ],
            queryType: "EntityHistory",
            refId: "A"
          }
        ],
        title: "Drive System",
        type: "grafana-iot-twinmaker-sceneviewer-panel"
      },
      {
        datasource: {
          type: "datasource",
          uid: "grafana"
        },
        fieldConfig: {
          defaults: {
            color: {
              mode: "thresholds"
            },
            custom: {
              hideFrom: {
                legend: false,
                tooltip: false,
                viz: false
              }
            },
            mappings: [],
            thresholds: {
              mode: "absolute",
              steps: [
                {
                  color: "green",
                  value: null
                },
                {
                  color: "red",
                  value: 80
                }
              ]
            }
          },
          overrides: []
        },
        gridPos: {
          h: 12,
          w: 24,
          x: 0,
          y: 29
        },
        id: 66,
        options: {
          basemap: {
            config: {},
            name: "Layer 0",
            type: "default"
          },
          controls: {
            mouseWheelZoom: true,
            showAttribution: true,
            showDebug: false,
            showScale: false,
            showZoom: true
          },
          layers: [
            {
              config: {
                blur: 9,
                radius: 22,
                weight: {
                  fixed: 1,
                  max: 1,
                  min: 0
                }
              },
              name: "Layer 1",
              tooltip: true,
              type: "heatmap"
            }
          ],
          view: {
            id: "coords",
            lat: 46,
            lon: 14,
            zoom: 4
          }
        },
        pluginVersion: "8.4.7",
        targets: [
          {
            datasource: {
              type: "datasource",
              uid: "grafana"
            },
            queryType: "randomWalk",
            refId: "A"
          }
        ],
        title: "Panel Title",
        type: "geomap"
      },
      {
        collapsed: false,
        gridPos: {
          h: 1,
          w: 24,
          x: 0,
          y: 41
        },
        id: 52,
        panels: [],
        title: "Alarms",
        type: "row"
      }
    ],
    refresh: "30s",
    schemaVersion: 35,
    style: "dark",
    tags: [],
    templating: {
      list: [
        {
          current: {
            selected: false,
            text: "wind",
            value: "wind"
          },
          hide: 2,
          name: "sel_entity_name",
          options: [
            {
              selected: true,
              text: "watertank",
              value: "watertank"
            }
          ],
          query: "watertank",
          skipUrlSync: false,
          type: "textbox"
        },
        {
          current: {
            selected: true,
            text: "wind",
            value: "wind"
          },
          hide: 0,
          name: "sel_entity",
          options: [
            {
              selected: true,
              text: "watertank",
              value: "watertank"
            }
          ],
          query: "watertank",
          skipUrlSync: false,
          type: "textbox"
        },
        {
          current: {
            selected: false,
            text: "WaterTank",
            value: "WaterTank"
          },
          hide: 2,
          name: "sel_comp",
          options: [
            {
              selected: true,
              text: "WaterTank",
              value: "WaterTank"
            }
          ],
          query: "WaterTank",
          skipUrlSync: false,
          type: "textbox"
        },
        {
          current: {
            selected: false,
            text: "wind",
            value: "wind"
          },
          hide: 0,
          label: "",
          name: "kvs_stream_name",
          options: [
            {
              selected: true,
              text: "watertank",
              value: "watertank"
            }
          ],
          query: "watertank",
          skipUrlSync: false,
          type: "textbox"
        }
      ]
    },
    time: {
      from: "now-5m",
      to: "now"
    },
    timepicker: {},
    timezone: "",
    title: `${config.dashboardType} Summary`,
    version: 16,
    weekStart: ""
  },
});
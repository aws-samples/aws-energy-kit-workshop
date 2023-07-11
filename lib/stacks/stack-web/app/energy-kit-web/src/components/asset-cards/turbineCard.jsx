import * as React from "react";
import {Cards, Link, Box, Button, Header} from "@cloudscape-design/components/cards";
import { TurbineAnimation } from "../turbine-animation/turbineTwinIconOrange";

const TurbineCards = (props) => {

    const sensorValues = props.sensorValues;
    console.log(sensorValues);
    let items = props.turbineTelemetry
    
    {
        //[
        //{
          //name: "Item 1",
          //alt: "First",
          //description: "This is the first item",
          //type: "1A",
          //size: "Small"
        //}
      //]
    }

    <Cards
      ariaLabels={{
        itemSelectionLabel: (e, t) => `select ${t.name}`,
        selectionGroupLabel: "Item selection"
      }}
      cardDefinition={{
        header: item => (
          <Link fontSize="heading-m">{item.name}</Link>
        ),
        sections: [
          {
            id: "animation",
            content: item => <TurbineAnimation props={item}/>
          },
          {
            id: "location",
            header: "Location",
            content: item => item.location
          },
          {
            id: "rpm",
            header: "RPM",
            content: item => item.rpm
          },
          {
            id: "temp",
            header: "Temp",
            content: item => item.temp
          }
        ]
      }}
      cardsPerRow={[
        { cards: 1 },
        { minWidth: 500, cards: 2 }
      ]}
      
      loadingText="Loading resources"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
          <Box
            padding={{ bottom: "s" }}
            variant="p"
            color="inherit"
          >
            No resources to display.
          </Box>
          <Button>Add Turbine</Button>
        </Box>
      }
      header={<Header>Simulated Turbines</Header>}
    />

  
  
  
  }
  
  export default TurbineCards;
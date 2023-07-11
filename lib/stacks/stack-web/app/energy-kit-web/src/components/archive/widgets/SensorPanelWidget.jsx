import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'
//import { API, graphqlOperation } from 'aws-amplify';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import theme from '../../theme';
import { render } from '@testing-library/react';
import Box from '@mui/material/Box';
//import { onCreateSensorValue } from '../../graphql/subscriptions';
//import { GetSensor } from '../../api/Sensors';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';

console.log({theme});

const useStyles = makeStyles(theme => ({
  dashboardContainer: {
    marginTop: 100
  },
  title: {
    marginBottom: 20,
    minHeight: 30
  },
  paper: {
    padding: theme.spacing(1),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: 200,
  },
  paperTitle: {
    fontSize: 20
  },
  value: {
    fontSize: 75,
    marginTop: 10,
    marginLeft: 'auto',
    marginRight: 'auto'
  }
}));


const SensorPanelWidget = (props) => {

  const classes = useStyles();
  const sensorValues = props.sensorValues;
  console.log(sensorValues);


const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: 'white',
  elevation: 10,
  backgroundColor: "#004d40"
}));

  const SensorPanel = () => {
        return (
      <Box sx={{ flexGrow: 1 }} justifyContent="center">
        <Grid container item spacing={1}>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
        <Item>
          <Typography variant="h6" align="center" >
            Temp
          </Typography>
          <Divider color="white" />
          <Typography variant="h5" align="center" >
          {sensorValues.temp}
          </Typography>
          </Item>
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
      <Item>
          <Typography variant="h6" align="center" >
            Pressure
          </Typography>
          <Divider color="white" />
          <Typography variant="h5" align="center" >
          {sensorValues.pressure}Az
          </Typography>
          </Item>
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
      <Item>
          <Typography variant="h6" align="center" >
          Humidity
          </Typography>
          <Divider color="white" />
          <Typography variant="h5" align="center" >
          {sensorValues.humidity}
          </Typography>
          </Item>
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
      <Item>
          <Typography variant="h6" align="center" >
            Current
          </Typography>
          <Divider color="white" />
          <Typography variant="h5" align="center" >
          {sensorValues.pressure}mAmp
          </Typography>
      </Item>
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
      <Item>
          <Typography variant="h6" align="center" >
            Voltage
          </Typography>
          <Divider color="white" />
          <Typography variant="h5" align="center" >
          {sensorValues.voltage}mWh
          </Typography>
      </Item>
      </Grid>
      <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
      <Item>
          <Typography variant="h6" align="center" >
            Power
          </Typography>
          <Divider color="white" />
          <Typography variant="h5" align="center" >
          {sensorValues.power}mW
          </Typography>
      </Item>
      </Grid>
      </Grid>
    </Box> 
        ) 
      };

//fetch sensor to get name
    return (
      <Container className={classes.dashboardContainer} maxWidth="lg">
        <div className="sensor-panel">
          <SensorPanel />
        </div>
      </Container>
    );
}

export default SensorPanelWidget;

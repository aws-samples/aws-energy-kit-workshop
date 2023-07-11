import EmeraldPiRefArch1 from '../Images/EmeraldPiRefArch1.svg'
import EmeraldPiRefArch2 from '../Images/EmeraldPiRefArch2.svg'
import EmeraldPiRefArch3 from '../Images/EmeraldPiRefArch3.svg'
import EmeraldPiRefArch4 from '../Images/EmeraldPiRefArch4.svg'
import EmeraldPiRefArch5 from '../Images/EmeraldPiRefArch5.svg'
import EmeraldPiRefArchArrow from '../Images/EmeraldPiRefArchArrow.svg'
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideoLabelIcon from '@mui/icons-material/VideoLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import Box from '@material-ui/core/Box';
import { withTheme } from '@material-ui/core/styles';
import { Icon } from "@material-ui/core";
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import MemoryIcon from '@mui/icons-material/Memory';
import SendIcon from '@mui/icons-material/Send';
import DnsIcon from '@mui/icons-material/Dns';

const steps = [
  'Your Edge Device',
  'Your Local Protocol Server',
  'AWS IoT Greengrass Core',
  'MQTT',
  'IoT Core'
];

const ColorlibConnector = styled(StepConnector)((props) => (
  {
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 40,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor:
      "#337066",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor:
      "#00352c",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      props.theme.palette.mode === 'dark' ? props.theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 80,
  height: 80,
  display: 'flex',
  borderRadius: '20%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor:
      'orange',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundColor:
      'orange',
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: <MemoryIcon />,
    2: <DnsIcon />,
    3: <DeviceHubIcon />,
    4: <SendIcon />,
    5: <VideoLabelIcon />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {
  /**
   * Whether this step is active.
   * @default false
   */
  active: PropTypes.bool,
  className: PropTypes.string,
  /**
   * Mark the step as completed. Is passed to child components.
   * @default false
   */
  completed: PropTypes.bool,
  /**
   * The label displayed in the step icon.
   */
  icon: PropTypes.node,
};

export default function MessagePathAnimation(props) {
  return (
    <Box sx={{ width: '100%' }}>
<Stepper alternativeLabel activeStep={props.activeStep} connector={<ColorlibConnector />}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
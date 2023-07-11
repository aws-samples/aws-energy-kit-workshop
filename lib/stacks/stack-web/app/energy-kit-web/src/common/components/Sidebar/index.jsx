import React from 'react'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import  { SideNavigation,  Badge } from '@cloudscape-design/components';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
  <SideNavigation

    activeHref={location.pathname}
    header={{ text: 'EnergyKit', href: '/' }}
    onFollow={event => {
      if (!event.detail.external) {
        event.preventDefault();
        // setActiveHref(event.detail.href);
        navigate(event.detail.href);

      }
    }}
    items={[
      // { type: "link", text: "Dashboard", href: "/" },
      {
        type: 'section',
        text: 'Getting Started',
        expanded: true,
        items: [
          { type: 'link', text: 'Get Started', href: '/get-started' },
          { type: 'link', text: 'Control Panel', href: '/control-panel' },
        ]
      },
      {
        type: 'section',
        text: 'Admin',
        expanded: true,
        items: [
          { type: 'link', text: 'Users', href: 'https://us-east-1.console.aws.amazon.com/cognito/v2/home?region=us-east-1', external: true},
          { type: 'link', text: 'Groups', href: 'https://us-east-1.console.aws.amazon.com/cognito/v2/home?region=us-east-1',  external: true },
          { type: 'link', text: 'Edit App', href: 'https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1',  external: true },
        ]
      },
      // {
      //   type: 'section',
      //   text: 'Account',
      //   expanded: true,
      //   items: [
      //     { type: 'link', text: 'Settings', href: '/account-settings' },
      //   ]
      // },
      {
        type: 'section',
        text: 'AWS Resources',
        expanded: true,
        items: [
          { type: 'link', text: 'IoT Core', href: 'https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1' },
          { type: 'link', text: 'IoT TwinMaker', href: 'https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1' },
          { type: 'link', text: 'WindRacer Dashboard', href: 'https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1' },
        ]
      },
      // Example of notifications in sidebar, uncomment this if not needed
      {
        type: 'section',
        text: 'Utilities',
        expanded: true,
      items: [{
        type: "link",
        text: "Notifications",
        href: "#/notifications",
        info: <Badge color="green">8</Badge>
      },
      {
        type: "link",
        text: "Documentation",
        href: "https://github.com/aws-samples",
        external: true
      }
    ]
  }


    ]}

    />
    </>
  )
  }

  export default Sidebar;

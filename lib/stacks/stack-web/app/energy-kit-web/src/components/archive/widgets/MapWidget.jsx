import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import settings from '../../settings.json';
import fetchFakeData from '../MapComponents/fake-api/fetchFakeMapData';
import MapPopup from '../MapComponents/MapPopup';


import '../../App.css';
import AssetMarker from '../MapComponents/AssetMarker';

mapboxgl.accessToken = settings.mapboxApiAccessToken;

const MapWidget = () => {
  const mapContainerRef = useRef(null);
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  // initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // See style options here: https://docs.mapbox.com/api/maps/#styles
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-104.9876, 39.7405],
      zoom: 8,
    });

    // clean up on unmount
    return () => map.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div className="map-container" ref={mapContainerRef} />;
};

export default MapWidget;
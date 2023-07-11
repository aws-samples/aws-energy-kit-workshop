import React from 'react';
import 'mapbox-gl/dist/mapbox-gl.css'
import { Marker } from 'mapbox-gl';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const AssetMarker = (props) => {

    return (

        <Marker
            key={props.id}
            longitude={props.longitude}
            latitude={props.latitude}
        >
            <FiberManualRecordIcon 
                fontSize="small" 
                style={{ color: props.color }}
                onClick={()=>props.onSensorClick(props.id)} 
            />
        
        </Marker>

    );
}

export default AssetMarker;
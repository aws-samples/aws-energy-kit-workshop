import React from "react"
import ProgressTracker, {
  ProgressTrackerStep,
} from "../../../front_end_library/@amzn/meridian/progress-tracker"

const TrackDataPipeline = () => {
  return (
    <ProgressTracker
      direction="row"
      compact={false}
    >
      <ProgressTrackerStep
        type="past"
        label={<strong>Sensor</strong>}
        showLabel={true}
        trackLength={10}
      >
        Upload files
        <br />
        in any format.
      </ProgressTrackerStep>
      <ProgressTrackerStep
        type="present"
        label={<strong>Greengrass Core Device</strong>}
        showLabel={true}
        trackLength={10}
      >
        Data Crawlers
        <br />
        identify schema.
      </ProgressTrackerStep>
      <ProgressTrackerStep
        type="future"
        label={<strong>Internet</strong>}
        showLabel={true}
        trackLength={10}
      >
        Store in
        <br />
        standard format.
      </ProgressTrackerStep>
      <ProgressTrackerStep
        type="future"
        label={<strong>AWS IoT Core</strong>}
        showLabel={true}
        trackLength={10}
      >
        Audit data quality
        <br />
        and display result.
      </ProgressTrackerStep>
      <ProgressTrackerStep
        type="future"
        label={<strong>IoT Rule and IoT Action</strong>}
        showLabel={true}
        trackLength={10}
      >
        Visit the data
        <br />
        browser to review.
      </ProgressTrackerStep>
    </ProgressTracker>
  )
}

export default TrackDataPipeline;
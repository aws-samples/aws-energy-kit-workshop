import PropTypes from "prop-types";

const styles = {
  instructionHeading: { marginTop: "16px", marginBottom: "3px" },
  instructionBodyText: { marginBottom: "12px" },
};

const Instructions = ({ region, amplifyAppId, amplifyRepoName }) => {
  return (
    <>
      <div style={styles.instructionHeading}>
        <b>Instructions and Next Steps</b>
      </div>
      <div style={styles.instructionBodyText}>
        This web app was built using{" "}
        <a
          href={`https://${region}.console.aws.amazon.com/amplify/home?region=${region}#/${amplifyAppId}`}
        >
          AWS Amplify
        </a>
        {" "}
        which is a complete solution that lets frontend web and mobile
        developers easily build, ship, and host full-stack applications on AWS.
        No cloud expertise needed.
        </div>
        <div style={styles.instructionBodyText}>
        The app allows you to send control messages to the WindRacer model
        turbines (above), and to view the telemetry messages the turbines are
        sending (right).
        </div>
        <div style={styles.instructionBodyText}>
        To troubleshoot sending and receiving messages, use the{" "}
        <a
          href={`https://${region}.console.aws.amazon.com/iot/home?region=${region}#/test`}
        >
          MQTT Test Client
        </a>
        .
        </div>
        <div style={styles.instructionBodyText}>
        The code for this app is stored in this{" "}
        <a
          href={`https://${region}.console.aws.amazon.com/codesuite/codecommit/repositories/${amplifyRepoName}/browse?region=${region}`}
        >
          AWS CodeCommit repository
        </a>
        .
      </div>
    </>
  );
};

Instructions.propTypes = {
  region: PropTypes.string.isRequired,
  amplifyAppId: PropTypes.string.isRequired,
  amplifyRepoName: PropTypes.string.isRequired,
};
export default Instructions;

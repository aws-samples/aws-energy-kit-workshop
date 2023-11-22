import PropTypes from "prop-types";

const Instructions = ({ region, amplifyAppId, amplifyRepoName }) => {
  return (
    <>
      <b>Instructions and Next Steps</b>
      <p>
        This web app was built using{" "}
        <a
          href={`https://${region}.console.aws.amazon.com/amplify/home?region=${region}#/${amplifyAppId}`}
        >
          AWS Amplify
        </a>{" "}
        which is a complete solution that lets frontend web and mobile
        developers easily build, ship, and host full-stack applications on AWS.
        No cloud expertise needed.
        <br></br>
        The app allows you to send control messages to the WindRacer model
        turbines (above), and to view the telemetry messages the turbines are
        sending (right).
        <br></br>
        <br></br>
        To troubleshoot sending and receiving messages, use the{" "}
        <a
          href={`https://${region}.console.aws.amazon.com/iot/home?region=${region}#/test`}
        >
          MQTT Test Client
        </a>
        .<br></br>
        <br></br>
        The code for this app is stored in this{" "}
        <a
          href={`https://${region}.console.aws.amazon.com/codesuite/codecommit/repositories/${amplifyRepoName}/browse?region=${region}`}
        >
          AWS CodeCommit repository
        </a>
        .
      </p>
    </>
  );
};

Instructions.propTypes = {
  region: PropTypes.string.isRequired,
  amplifyAppId: PropTypes.string.isRequired,
  amplifyRepoName: PropTypes.string.isRequired,
};
export default Instructions;

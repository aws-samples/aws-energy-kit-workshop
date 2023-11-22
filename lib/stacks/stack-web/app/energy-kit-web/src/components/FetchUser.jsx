import { useEffect } from "react";
import PropTypes from "prop-types";
import {
  IoTClient,
  AttachPolicyCommand,
  DetachPolicyCommand,
} from "@aws-sdk/client-iot";

const FetchUser = ({ credentials, user, region, pubSubPolicyName }) => {
  useEffect(() => {
    const client = new IoTClient({ region: region, credentials: credentials });
    const input = {
      policyName: pubSubPolicyName,
      target: credentials.identityId,
    };

    const attachPolicy = async () => {
      console.log(
        `Attaching policy ${input.policyName} to target ${input.target}`
      );
      const command = new AttachPolicyCommand(input);
      try {
        await client.send(command);
        console.log("Policy attach success");
      } catch (err) {
        console.error(err);
      }
    };

    const detachPolicy = async () => {
      console.log(
        `Detaching policy ${input.policyName} to target ${input.target}`
      );
      const command = new DetachPolicyCommand(input);
      try {
        await client.send(command);
        console.log("Policy detach success");
      } catch (err) {
        console.error(err);
      }
    };

    credentials.identityId && attachPolicy(input);

    return () => {
      credentials.identityId && detachPolicy(input);
    };
  }, [pubSubPolicyName, credentials, region]);

  return <>{user.attributes.email}</>;
};

FetchUser.propTypes = {
  credentials: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  region: PropTypes.string.isRequired,
  pubSubPolicyName: PropTypes.string.isRequired,
};
export default FetchUser;

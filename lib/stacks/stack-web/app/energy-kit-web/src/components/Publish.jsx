import { useEffect } from "react";
import PropTypes from "prop-types";
import { PubSub } from "aws-amplify";
import { Button } from "@aws-amplify/ui-react";
import toast from "react-hot-toast";

const styles = {
  turbineControlButton: { fontWeight: "normal", width: "130px" },
};

const Publish = ({ commandTopic }) => {
  useEffect(() => {
    console.log(`Subscribing to ${commandTopic}`);
    const commandSubscribe = PubSub.subscribe(commandTopic).subscribe({
      next: (msg) => {
        // console.log("Command message received: " + JSON.stringify(msg.value));
        toast.success(JSON.stringify(msg.value));
      },
      error: (err) => console.log("commandSub failed to subscribe: ", err),
      close: () => console.log("commandSub close"),
    });
    return () => {
      console.log(`Unsubscribing from ${commandTopic}`);
      commandSubscribe.unsubscribe();
    };
  });

  const sendMessage = (message) => {
    // console.log("Publishing command message:" + JSON.stringify(message));
    PubSub.publish(commandTopic, message);
  };

  return (
    <>
      <b>Control the WindRacer model turbines</b>
      <p>Send message to topic &apos;{commandTopic}&apos;:</p>
      <p>
        <Button
          variation="primary"
          colorTheme="success"
          style={styles.turbineControlButton}
          onClick={() => sendMessage({ simulate: 1, anomaly: "True" })}
        >
          Simulate = 1
        </Button>
        &nbsp;
        <Button
          variation="primary"
          colorTheme="error"
          style={styles.turbineControlButton}
          onClick={() => sendMessage({ simulate: 0, anomaly: "True" })}
        >
          Simulate = 0
        </Button>
      </p>
    </>
  );
};

Publish.propTypes = {
  commandTopic: PropTypes.string.isRequired,
};
export default Publish;

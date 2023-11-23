import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { PubSub } from "aws-amplify";
import { Card, View, ScrollView } from "@aws-amplify/ui-react";

const styles = {
  telemetryMessageView: {
    backgroundColor: " #EEEEEE",
    marginTop: 1,
    marginBottom: 5,
    marginLeft: 1,
    padding: 10,
    flexGrow: 6,
  },
  telemetryMessageCard: {
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    whiteSpace: "pre-wrap",
  },
};

const Messages = ({ telemetryTopic, telemetryListLength }) => {
  const [telemetryMessages, setTelemetryMessages] = useState([]);

  useEffect(() => {
    console.log(`Subscribing to ${telemetryTopic}`);
    const telemetrySubscribe = PubSub.subscribe(telemetryTopic).subscribe({
      next: (msg) => {
        // console.log("Command message received: " + JSON.stringify(msg.value));
        setTelemetryMessages((telemetryMessages) => [
          msg.value,
          ...telemetryMessages.slice(0, telemetryListLength),
        ]);
      },
      error: (err) => console.log("commandSub failed to subscribe: ", err),
      close: () => console.log("commandSub close"),
    });
    return () => {
      console.log(`Unsubscribing from ${telemetryTopic}`);
      telemetrySubscribe.unsubscribe();
    };
  }, [telemetryTopic, telemetryListLength]);

  return (
    <View width="56rem" style={styles.telemetryMessageView}>
      <b>
        Messages received by subscription to topic &apos;
        {telemetryTopic}:&apos;
      </b>
      <ScrollView style={styles.telemetryMessageView}>
        {telemetryMessages.map((telemetryMessage, index) => (
          <Card
            key={index}
            variation="elevated"
            style={styles.telemetryMessageCard}
          >
            <b>Received {new Date().toLocaleTimeString()}</b>
            <br></br>
            {JSON.stringify(telemetryMessage, null, 3)}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

Messages.propTypes = {
  telemetryTopic: PropTypes.string.isRequired,
  telemetryListLength: PropTypes.number.isRequired,
};
export default Messages;

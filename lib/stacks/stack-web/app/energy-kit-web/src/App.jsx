import PropTypes from "prop-types";
import { Amplify, Auth, Hub } from "aws-amplify";
import { useEffect, useState } from "react";
import { AWSIoTProvider, CONNECTION_STATE_CHANGE } from "@aws-amplify/pubsub";
import {
  withAuthenticator,
  Button,
  Text,
  Heading,
  Flex,
  View,
} from "@aws-amplify/ui-react";
import { Toaster } from "react-hot-toast";
import awsConfig from "./aws-config";
import FetchUser from "./components/FetchUser";
import ControlPanel from "./components/ControlPanel";

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: awsConfig.aws_pubsub_region,
    aws_pubsub_endpoint: awsConfig.aws_pubsub_endpoint,
  })
);
Amplify.configure(awsConfig);
Hub.listen("pubsub", (data) => {
  const { payload } = data;
  if (payload.event === CONNECTION_STATE_CHANGE) {
    const connectionState = payload.data.connectionState;
    console.log("Hub " + connectionState);
  }
});

const styles = {
  topFlex: { backgroundColor: " #304050" },
  headingView: { textAlign: "center", padding: 9 },
  userStatusView: { textAlign: "center", padding: 5 },
};

const App = ({ signOut, user }) => {
  const [essentialCredentials, setEssentialCredentials] = useState({});

  useEffect(() => {
    Auth.currentCredentials().then((credentials) => {
      setEssentialCredentials(Auth.essentialCredentials(credentials));
    });
  }, []);

  return (
    <View>
      <Toaster reverseOrder={true} toastOptions={{ icon: "✉️" }} />
      <Flex
        direction="row"
        justifyContent="space-between"
        wrap="wrap"
        style={styles.topFlex}
      >
        <View width="21rem" style={styles.headingView}>
          <Heading level={4} style={{ color: "white" }}>
            {" "}
            WindRacer Control Panel{" "}
          </Heading>
        </View>
        <View style={styles.userStatusView}>
          <Text style={{ color: "white" }}>
            <FetchUser
              credentials={essentialCredentials}
              user={user}
              region={awsConfig.aws_pubsub_region}
              pubSubPolicyName={awsConfig.pubSubPolicyName}
            />{" "}
            <Button style={{ color: "white" }} onClick={signOut}>
              Sign out
            </Button>
          </Text>
        </View>
      </Flex>
      <ControlPanel exports={awsConfig} />
    </View>
  );
};

App.propTypes = {
  signOut: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

const AuthApp = withAuthenticator(App, { hideSignUp: true });

export default AuthApp;

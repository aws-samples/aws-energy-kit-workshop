import PropTypes from "prop-types";
import { Flex, View } from "@aws-amplify/ui-react";
import Publish from "./Publish";
import Instructions from "./Instructions";
import Messages from "./Messages";

const styles = {
  controlsAndInstructionsView: { marginTop: 1, padding: 20, flexGrow: 1 },
};

const ControlPanel = ({ exports }) => {
  return (
    <Flex
      direction="row"
      justifyContent="space-between"
      alignItems="stretch"
      alignContent="stretch"
      wrap="wrap"
    >
      <View width="20rem" style={styles.controlsAndInstructionsView}>
        <Publish commandTopic={exports.commandTopic} />
        <hr></hr>
        <Instructions
          region={exports.aws_project_region}
          amplifyAppId={exports.amplifyAppId}
          amplifyRepoName={exports.amplifyRepoName}
        />
      </View>
      <Messages
        telemetryTopic={exports.telemetryTopic}
        telemetryListLength={exports.telemetryListLength}
      />
    </Flex>
  );
};

ControlPanel.propTypes = {
  exports: PropTypes.object.isRequired,
};
export default ControlPanel;

import * as React from "react";
import { CodeEditor, Button } from "@cloudscape-design/components";

async function sendMqttMessage(message){
  console.log(message)
}


const MqttMessenger = (props) => {
  const [preferences, setPreferences] = React.useState(
    undefined
  );
  const [loading, setLoading] = React.useState(false);
    return (
      <div>
      <CodeEditor
      ace={ace}
      language="json"
      value={props.starterMessage}
      preferences={preferences}
      onPreferencesChange={e => setPreferences(e.detail)}
      loading={loading}
      i18nStrings={{
        loadingState: "Loading code editor",
        errorState:
          "There was an error loading the code editor.",
        errorStateRecovery: "Retry",
        editorGroupAriaLabel: "Code editor",
        statusBarGroupAriaLabel: "Status bar",
        cursorPosition: (row, column) =>
          `Ln ${row}, Col ${column}`,
        errorsTab: "Errors",
        warningsTab: "Warnings",
        preferencesButtonAriaLabel: "Preferences",
        paneCloseButtonAriaLabel: "Close",
        preferencesModalHeader: "Preferences",
        preferencesModalCancel: "Cancel",
        preferencesModalConfirm: "Confirm",
        preferencesModalWrapLines: "Wrap lines",
        preferencesModalTheme: "Theme",
        preferencesModalLightThemes: "Light themes",
        preferencesModalDarkThemes: "Dark themes"
      }}
    />
    <div>
    <Button variant="primary" onClick={sendMqttMessage("Content from the message box!")}>Send</Button>
    </div>
    </div>
    
    )
    
}
  
export default MqttMessenger;
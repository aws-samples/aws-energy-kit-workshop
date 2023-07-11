/* eslint-disable no-undef */
// -- AWS AMPLIFY CONFIGURATION PARAMETERS --
// ------------------------------------------
// ## These configuration parameters are dynamically generated at build ##
// ## They are passed from environmental variables in the CDK Amplify App ##
// ## This configuration file is rebuilt using those env variables every time it's deployed ##
// ------------------------------------------
const AmplifyConfig = {

  // Existing Auth
  Auth: {
    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,

    // REQUIRED - Amazon Cognito Region
    region: import.meta.env.VITE_REGION, // Replace with the region you deployed CDK with

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: import.meta.env.VITE_REGION,

    // REQUIRED - Amazon Cognito User Pool ID
    userPoolId: import.meta.env.VITE_USER_POOL_ID, // Replace with your User Pool ID

    // REQUIRED - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_WEB_CLIENT_ID, // Replace with your User Pool Web Client ID

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: false,
    
    // Amplify Iot Integration

  },

}

export { AmplifyConfig }
  

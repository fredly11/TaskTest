import * as AWSAmplify from 'aws-amplify'

// Support different packaging/exports shapes (named exports or default)
const Amplify = AWSAmplify.Amplify ?? AWSAmplify.default?.Amplify ?? AWSAmplify

// Configure Amplify from Vite env vars. These should be set in your environment
// or in a .env file for local dev: VITE_AWS_REGION, VITE_AWS_COGNITO_USER_POOL_ID,
// VITE_AWS_COGNITO_USER_POOL_CLIENT_ID, VITE_AWS_COGNITO_IDENTITY_POOL_ID (optional)

const region = import.meta.env.VITE_AWS_REGION
const userPoolId = import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID
const userPoolWebClientId = import.meta.env.VITE_AWS_COGNITO_USER_POOL_CLIENT_ID
const identityPoolId = import.meta.env.VITE_AWS_COGNITO_IDENTITY_POOL_ID

if(userPoolId && userPoolWebClientId && region){
  // Provide both the common top-level Auth keys and a nested `Cognito` shape
  // expected by some Amplify internals (e.g., `Auth.Cognito.loginWith`).
  Amplify.configure({
    Auth: {
      region,
      userPoolId,
      userPoolWebClientId,
      // some internal modules look for `Auth.Cognito.*` so include it
      Cognito: {
        userPoolId,
        // Amplify internals may reference `userPoolClientId`
        userPoolClientId: userPoolWebClientId,
        // ensure `loginWith` exists (no-op) to avoid undefined reads
        loginWith: {
          oauth: undefined
        }
      },
      identityPoolId: identityPoolId || undefined,
      mandatorySignIn: false,
      authenticationFlowType: 'USER_PASSWORD_AUTH'
    }
  })
}

export default Amplify

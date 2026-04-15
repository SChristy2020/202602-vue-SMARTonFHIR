export const SMART_CONFIG = {
  // The issuer will be filled in via the LaunchView UI (provided by the Sandbox)
  // Leave issuer blank here; it will be passed in at authorize time
  clientId: "my-vue-app", // Sandbox usually works without strict registration (uses public client)
  redirectUri: `${window.location.origin}/callback`,
  scope: "launch openid profile patient/*.read",
};
import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Dynamic config on top of app.json. With APP_VARIANT=development the app
 * gets a separate identity ("BiteBook Dev", *.dev package/bundle id) so the
 * dev-client build can be installed alongside the real app on one device.
 * Everything else is inherited from app.json.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config as ExpoConfig;
  if (process.env.APP_VARIANT !== "development") return base;

  return {
    ...base,
    name: `${base.name} Dev`,
    ios: {
      ...base.ios,
      bundleIdentifier: `${base.ios?.bundleIdentifier}.dev`,
    },
    android: {
      ...base.android,
      package: `${base.android?.package}.dev`,
    },
  };
};

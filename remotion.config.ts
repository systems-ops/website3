import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// This sandbox has no network access to download Remotion's own headless
// Chrome, but a pre-installed one ships at this path — reuse it if present.
const preinstalledChrome =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (existsSync(preinstalledChrome)) {
  Config.setBrowserExecutable(preinstalledChrome);
}

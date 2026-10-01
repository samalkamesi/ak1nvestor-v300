// v219-prefix: vad säger npm:s prefix i node-exec-miljön?
import { execFileSync } from "node:child_process";
console.log("HOME =", process.env.HOME);
console.log("npm_config_prefix =", process.env.npm_config_prefix ?? "(osatt)");
for (const args of [["config", "get", "prefix"], ["prefix", "-g"]]) {
  try {
    console.log(`npm ${args.join(" ")} =`, execFileSync("npm", args, { encoding: "utf8", timeout: 30_000 }).trim());
  } catch (e) {
    console.log(`npm ${args.join(" ")} FEL:`, String(e.message).slice(0, 100));
  }
}

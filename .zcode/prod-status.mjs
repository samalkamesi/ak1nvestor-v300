import { execSync } from "node:child_process";
const kör = (cmd) => {
  try {
    return execSync(cmd, { cwd: "/home/ak1a/AK1", encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    return `FEL: ${String(e.stdout || "")}${String(e.stderr || "")}`;
  }
};
console.log("=== status ===");
console.log(kör("git status --short").slice(0, 2000));
console.log("=== HEAD ===");
console.log(kör("git log --oneline -1"));

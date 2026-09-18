import { readFileSync, appendFileSync } from "node:fs";
appendFileSync("/home/ak1a/AK1/worklog.md", readFileSync("/home/ak1a/AK1/verktyg/_s9u3-1789709700201-worklog.txt", "utf8"));
console.log("worklog +1 sektion");

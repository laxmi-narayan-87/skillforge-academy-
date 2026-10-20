import { spawnSync } from "node:child_process";

const result = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});

if (result.error) {
  console.error("Could not execute npm audit:", result.error.message);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout || "");
} catch {
  console.error("npm audit did not return valid JSON.");
  console.error((result.stderr || result.stdout || "No audit output").slice(-4000));
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities || {};
const names = Object.keys(vulnerabilities);
const allowedAdvisory = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";

// The upstream braces advisory currently has no fix. Keep this as a narrow,
// explicit exception; fail if a different vulnerable package/advisory appears,
// or if npm later reports a fix for this one.
const onlyKnownUnfixedBraces =
  names.length === 1 &&
  names[0] === "braces" &&
  vulnerabilities.braces?.fixAvailable === false &&
  vulnerabilities.braces?.via?.length > 0 &&
  vulnerabilities.braces.via.every(
    (item) => typeof item === "object" && item.url === allowedAdvisory,
  );

if (names.length === 0) {
  console.log("Production dependency audit passed: no reported vulnerabilities.");
  process.exit(0);
}

if (onlyKnownUnfixedBraces) {
  console.warn(
    "Production audit exception: braces has a high-severity upstream advisory " +
      "with no available fix. It is pulled in by the Tailwind CSS build toolchain. " +
      "Monitor the advisory and remove this exception when an upstream fix ships.",
  );
  console.warn(allowedAdvisory);
  process.exit(0);
}

console.error("Production dependency audit failed with unapproved findings:");
console.error(JSON.stringify(vulnerabilities, null, 2));
process.exit(1);

import fs from "fs";
import path from "path";

async function globalTeardown() {
  try {
    const response = await fetch("http://localhost:3000/__coverage__");
    if (response.ok) {
      const coverageData = await response.json();
      // process.cwd() = client/, so go up one level to reach server/
      const nycDir = path.resolve(process.cwd(), "..", "server", ".nyc_output");
      if (!fs.existsSync(nycDir)) {
        fs.mkdirSync(nycDir, { recursive: true });
      }
      const outFile = path.join(nycDir, "e2e-coverage.json");
      fs.writeFileSync(outFile, JSON.stringify(coverageData));
      console.log(`✅ E2E coverage data saved to ${outFile}`);
    } else {
      console.log("⚠️  No coverage data available (server not instrumented with nyc?)");
    }
  } catch (err) {
    console.log("⚠️  Could not fetch coverage data from server:", err);
  }
}

export default globalTeardown;

import fs from "node:fs";
import { globbySync } from "globby";
import { getIcons } from "@iconify/utils";
import mdi from "@iconify/json/json/mdi.json";
import octicon from "@iconify/json/json/octicon.json";

const gatherIconNames = (patterns: string[], iconSetNames: string[]) => {
  const paths = globbySync(patterns);
  const map = new Map(iconSetNames.map((n) => [n, new Set<string>()] as const));
  const regexp = new RegExp(`"(${iconSetNames.join("|")}):([0-9a-z-]+)"`, "g");
  for (const path of paths) {
    const content = fs.readFileSync(path, "utf-8");
    for (const m of content.matchAll(regexp)) {
      map.get(m[1]).add(m[2]);
    }
  }
  return map;
};

const iconNames = gatherIconNames(
  ["src/react/**/*.{ts,tsx}", "!*.d.ts", "!src/react/generated"],
  ["mdi", "octicon"]
);
const data = [mdi, octicon].map((iconSet) => getIcons(iconSet, [...iconNames.get(iconSet.prefix)]));
if (!fs.existsSync("src/react/generated")) {
  fs.mkdirSync("src/react/generated");
}

fs.writeFileSync("src/react/generated/iconbundle.json", JSON.stringify(data, null, 2));

import fs from "fs";
import HandleBars from "handlebars";
import { lookupCollection } from "@iconify/json";
import { getIcons } from "@iconify/utils/lib/icon-set/get-icons";
import { IconifyJSON } from "@iconify/types";

const icons: Record<string, string[]> = {
  mdi: [
    "account",
    "alert-outline",
    "alert-circle-outline",
    "check-circle-outline",
    "chevron-down",
    "chevron-up",
    "clock-outline",
    "close",
    "cog",
    "console",
    "content-copy",
    "file-tree",
    "filter",
    "folder-search-outline",
    "history",
    "home",
    "information-outline",
    "map-marker",
    "map-marker-distance",
    "menu",
    "minus",
    "plus",
    "reload",
    "content-save",
    "undo"
  ],
  octicon: [
    "check-circle-16",
    "diff-added-16",
    "diff-ignored-16",
    "diff-modified-16",
    "diff-removed-16",
    "diff-renamed-16",
    "file-code-16",
    "git-branch-16",
    "git-compare-16"
  ],
  carbon: ["drag-horizontal", "drag-vertical"]
};

const load = async () => {
  const data: IconifyJSON[] = [];
  const iconNames: string[] = [];
  for (const collectionName in icons) {
    const iconifyJson = await lookupCollection(collectionName);
    const filteredJson = getIcons(iconifyJson, icons[collectionName]);
    if (filteredJson) {
      iconNames.push(...icons[collectionName].map((name) => `${collectionName}:${name}`));
      data.push(filteredJson);
    }
  }
  return { data, iconNames };
};

const templateSource = `// Generated by build/create-iconbundle.js

/* prettier-ignore */
export type IconName = (
{{#each iconNames}}
 | "{{.}}"
{{/each}}
);
`;

const generate = async () => {
  const { data, iconNames } = await load();
  if (!fs.existsSync("src/react/generated")) {
    fs.mkdirSync("src/react/generated");
  }

  await fs.promises.writeFile("src/react/generated/iconbundle.json", JSON.stringify(data, null, 2));
  const template = HandleBars.compile(templateSource);
  await fs.promises.writeFile("src/react/generated/IconName.d.ts", template({ iconNames }));
};

generate().catch((e) => {
  console.error(e);
});

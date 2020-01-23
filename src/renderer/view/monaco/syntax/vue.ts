/* ---------------------------------------------------------------------------------------------
 *  Forked from monaco-languages/src/html/html.js
 *  (Copyright (c) Microsoft Corporation, liensed under the MIT)
 * --------------------------------------------------------------------------------------------
 */
"use strict";

const conf: monaco.languages.LanguageConfiguration = {
  wordPattern: /(-?\d*\.\d\w*)|([^`~!@$^&*()=+[{]}\\|;:'",.<>\/\s]+)/g,

  comments: {
    blockComment: ["<!--", "-->"]
  },

  brackets: [
    ["<!--", "-->"],
    ["<", ">"],
    ["{", "}"],
    ["(", ")"]
  ],

  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],

  surroundingPairs: [
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "<", close: ">" }
  ],

  onEnterRules: [
    {
      beforeText: /^<(\w[\w\d]*)([^/>]*(?!\/)>)[^<]*$/i,
      afterText: /^<\/(\w[\w\d]*)\s*>$/i,
      action: { indentAction: monaco.languages.IndentAction.IndentOutdent }
    },
    {
      beforeText: /^<(\w[\w\d]*)([^/>]*(?!\/)>)[^<]*$/i,
      action: { indentAction: monaco.languages.IndentAction.Indent }
    }
  ],

  folding: {
    markers: {
      start: new RegExp("^\\s*<!--\\s*#region\\b.*-->"),
      end: new RegExp("^\\s*<!--\\s*#endregion\\b.*-->")
    }
  }
};

const language = {
  defaultToken: "",
  tokenPostfix: ".vue",
  ignoreCase: true,

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      [/<!--/, "comment", "@comment"],
      [
        /(<)((?:[\w-]+:)?[\w-]+)(\s*)(\/>)/,
        ["delimiter", "tag", "", "delimiter"]
      ],
      [/(<)(template)/, ["delimiter", { token: "tag", next: "@template" }]],
      [/(<)(script)/, ["delimiter", { token: "tag", next: "@script" }]],
      [/(<)(style)/, ["delimiter", { token: "tag", next: "@style" }]],
      [
        /(<)((?:[\w-]+:)?[\w-]+)/,
        ["delimiter", { token: "tag", next: "@otherTag" }]
      ],
      [
        /(<\/)((?:[\w-]+:)?[\w-]+)/,
        ["delimiter", { token: "tag", next: "@otherTag" }]
      ],
      [/</, "delimiter"],
      [/[^<]+/] // text
    ],

    comment: [
      [/-->/, "comment", "@pop"],
      [/[^-]+/, "comment.content"],
      [/./, "comment.content"]
    ],

    otherTag: [
      [/\/?>/, "delimiter", "@pop"],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [/[ \t\r\n]+/] // whitespace
    ],

    // -- BEGIN <template> tags handling
    // After <template
    template: [
      [/lang/, "attribute.name", "@templateAfterLang"],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [
        />/,
        {
          token: "delimiter",
          next: "@templateEmbedded",
          nextEmbedded: "text/html"
        }
      ],
      [/[ \t\r\n]+/], // whitespace
      [
        /(<\/)(template\s*)(>)/,
        ["delimiter", "tag", { token: "delimiter", next: "@pop" }]
      ]
    ],

    // After <template ... lang
    templateAfterLang: [
      [/=/, "delimiter", "@templateAfterLangEquals"],
      [
        />/,
        {
          token: "delimiter",
          next: "@templateEmbedded",
          nextEmbedded: "text/html"
        }
      ], // cover invalid e.g. <template lang>
      [/[ \t\r\n]+/], // whitespace
      [/<\/template\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    // After <template ... lang =
    templateAfterLangEquals: [
      [
        /"([^"]*)"/,
        { token: "attribute.value", switchTo: "@templateWithCustomLang.$1" }
      ],
      [
        /'([^']*)'/,
        { token: "attribute.value", switchTo: "@templateWithCustomLang.$1" }
      ],
      [
        />/,
        {
          token: "delimiter",
          next: "@templateEmbedded",
          nextEmbedded: "text/html"
        }
      ], // cover invalid e.g. <template lang=>
      [/[ \t\r\n]+/], // whitespace
      [/<\/template\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    // After <template ... lang = $S2
    templateWithCustomLang: [
      [
        />/,
        {
          token: "delimiter",
          next: "@templateEmbedded.$S2",
          nextEmbedded: "$S2"
        }
      ],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [/[ \t\r\n]+/], // whitespace
      [/<\/template\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    templateEmbedded: [
      [
        /<\/template/,
        { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }
      ],
      [/[^<]+/, ""]
    ],

    // -- END <template> tags handling

    // -- BEGIN <script> tags handling
    // After <script
    script: [
      [/lang/, "attribute.name", "@scriptAfterLang"],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [
        />/,
        {
          token: "delimiter",
          next: "@scriptEmbedded",
          nextEmbedded: "text/javascript"
        }
      ],
      [/[ \t\r\n]+/], // whitespace
      [
        /(<\/)(script\s*)(>)/,
        ["delimiter", "tag", { token: "delimiter", next: "@pop" }]
      ]
    ],

    // After <script ... lang
    scriptAfterLang: [
      [/=/, "delimiter", "@scriptAfterLangEquals"],
      [
        />/,
        {
          token: "delimiter",
          next: "@scriptEmbedded",
          nextEmbedded: "text/javascript"
        }
      ], // cover invalid e.g. <script lang>
      [/[ \t\r\n]+/], // whitespace
      [/<\/script\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    // After <script ... lang =
    scriptAfterLangEquals: [
      [
        /"tsx?"|'tsx?'/,
        { token: "attribute.value", switchTo: "@scriptWithCustomLang.ts" }
      ],
      [
        /"([^"]*)"/,
        { token: "attribute.value", switchTo: "@scriptWithCustomLang.$1" }
      ],
      [
        /'([^']*)'/,
        { token: "attribute.value", switchTo: "@scriptWithCustomLang.$1" }
      ],
      [
        />/,
        {
          token: "delimiter",
          next: "@scriptEmbedded",
          nextEmbedded: "text/javascript"
        }
      ], // cover invalid e.g. <script lang=>
      [/[ \t\r\n]+/], // whitespace
      [/<\/script\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    // After <script ... lang = $S2
    scriptWithCustomLang: [
      [
        />/,
        { token: "delimiter", next: "@scriptEmbedded.$S2", nextEmbedded: "$S2" }
      ],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [/[ \t\r\n]+/], // whitespace
      [/<\/script\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    scriptEmbedded: [
      [/<\/script/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }],
      [/[^<]+/, ""]
    ],

    // -- END <script> tags handling

    // -- BEGIN <style> tags handling
    // After <style
    style: [
      [/lang/, "attribute.name", "@styleAfterLang"],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [
        />/,
        { token: "delimiter", next: "@styleEmbedded", nextEmbedded: "text/css" }
      ],
      [/[ \t\r\n]+/], // whitespace
      [
        /(<\/)(style\s*)(>)/,
        ["delimiter", "tag", { token: "delimiter", next: "@pop" }]
      ]
    ],

    // After <style ... lang
    styleAfterLang: [
      [/=/, "delimiter", "@styleAfterLangEquals"],
      [
        />/,
        { token: "delimiter", next: "@styleEmbedded", nextEmbedded: "text/css" }
      ], // cover invalid e.g. <style lang>
      [/[ \t\r\n]+/], // whitespace
      [/<\/style\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    // After <style ... lang =
    styleAfterLangEquals: [
      [
        /"([^"]*)"/,
        { token: "attribute.value", switchTo: "@styleWithCustomLang.$1" }
      ],
      [
        /'([^']*)'/,
        { token: "attribute.value", switchTo: "@styleWithCustomLang.$1" }
      ],
      [
        />/,
        { token: "delimiter", next: "@styleEmbedded", nextEmbedded: "text/css" }
      ], // cover invalid e.g. <style lang=>
      [/[ \t\r\n]+/], // whitespace
      [/<\/style\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    // After <style ... lang = $S2
    styleWithCustomLang: [
      [
        />/,
        { token: "delimiter", next: "@styleEmbedded.$S2", nextEmbedded: "$S2" }
      ],
      [/"([^"]*)"/, "attribute.value"],
      [/'([^']*)'/, "attribute.value"],
      [/[\w-]+/, "attribute.name"],
      [/=/, "delimiter"],
      [/[ \t\r\n]+/], // whitespace
      [/<\/style\s*>/, { token: "@rematch", next: "@pop" }]
    ],

    styleEmbedded: [
      [/<\/style/, { token: "@rematch", next: "@pop", nextEmbedded: "@pop" }],
      [/[^<]+/, ""]
    ]

    // -- END <style> tags handling
  }
} as monaco.languages.IMonarchLanguage;

export function install() {
  monaco.languages.register({
    id: "vue",
    extensions: [".vue"]
  });
  monaco.languages.setLanguageConfiguration("vue", conf);
  monaco.languages.setMonarchTokensProvider("vue", language);
}

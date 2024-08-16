const colors = require("@mui/material/colors");
const plugin = require("tailwindcss/plugin");

module.exports = {
  mode: "jit",
  content: ["./src/react/**/*.html", "./src/react/**/*.ts", "./src/react/**/*.tsx"],
  important: true,
  theme: {
    extend: {
      fontFamily: {
        normal: "var(--inazuma-default-fontfamily)",
        mono: "var(--inazuma-monospace-fontfamily)"
      },
      colors: {
        transparent: "transparent",
        current: "currentColor",
        hoverHighlight: "#ffffff08",
        highlight: "#ffffff16",
        primary: colors.lime.A700,
        secondary: colors.yellow.A700,
        error: colors.red[700],
        warning: colors.orange[700],
        success: colors.green[700],
        info: colors.blue[700],
        background: "#222",
        paper: "#333",
        splitter: colors.grey[800],
        titlebar: "#2a2a2a",
        tooltip: "#333",
        greytext: colors.grey[500],
        gray: colors.grey,
        backdrop: "#0002"
      },
      zIndex: {
        9999: 9999,
        999: 999
      },
      cursor: {
        "col-resize": "col-resize",
        "row-resize": "row-resize"
      }
    }
  },
  variants: {},
  plugins: [
    plugin(({ addUtilities }) => {
      // add shorthand of "flex flex-(row|col|row-reverse|col-reverse) flex-(nowrap|wrap|wrap-reverse)"
      const abbrs = {
        col: "column",
        "col-reverse": "column-reverse"
      };
      const newUtilities = {
        ".ellipsis": {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      };
      ["row", "col", "row-reverse", "col-reverse"].forEach((direction) => {
        ["nowrap", "wrap", "wrap-reverse"].forEach((wrap) => {
          const className = `.flex-${direction}-${wrap}`;
          const style = {
            display: "flex",
            flexDirection: abbrs[direction] || direction,
            flexWrap: wrap
          };
          newUtilities[className] = style;
        });
      });
      addUtilities(newUtilities);
    })
  ]
};

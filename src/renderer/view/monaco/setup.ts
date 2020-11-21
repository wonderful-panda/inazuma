import "monaco-editor";
import { install as installVueSyntax } from "./syntax/vue";
installVueSyntax();

monaco.editor.setTheme("vs-dark");

const { typescript, json, css } = monaco.languages;
[typescript.typescriptDefaults, typescript.javascriptDefaults].forEach((d) => {
  d.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true
  });
});

json.jsonDefaults.setDiagnosticsOptions({
  validate: false
});

[css.cssDefaults, css.lessDefaults, css.scssDefaults].forEach((d) =>
  d.setDiagnosticsOptions({ validate: false })
);

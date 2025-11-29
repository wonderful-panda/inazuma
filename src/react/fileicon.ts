import type { IconName } from "./types/IconName";
import { getExtension } from "./util";

export const getFileIcon = (path: string, isFolder: boolean): IconName => {
  if (isFolder) {
    return "mdi:folder";
  }

  const ext = getExtension(path).toLowerCase();

  // Programming languages
  if (ext === ".ts" || ext === ".tsx") return "mdi:language-typescript";
  if (ext === ".js" || ext === ".jsx" || ext === ".mjs" || ext === ".cjs")
    return "mdi:language-javascript";
  if (ext === ".py") return "mdi:language-python";
  if (ext === ".java") return "mdi:language-java";
  if (ext === ".cpp" || ext === ".cc" || ext === ".cxx") return "mdi:language-cpp";
  if (ext === ".c" || ext === ".h") return "mdi:language-c";
  if (ext === ".cs") return "mdi:language-csharp";
  if (ext === ".go") return "mdi:language-go";
  if (ext === ".rs") return "mdi:language-rust";
  if (ext === ".php") return "mdi:language-php";
  if (ext === ".rb") return "mdi:language-ruby";
  if (ext === ".swift") return "mdi:language-swift";
  if (ext === ".kt" || ext === ".kts") return "mdi:language-kotlin";
  if (ext === ".lua") return "mdi:language-lua";
  if (ext === ".r") return "mdi:language-r";

  // Markup and styles
  if (ext === ".html" || ext === ".htm") return "mdi:language-html5";
  if (ext === ".css") return "mdi:language-css3";
  if (ext === ".scss" || ext === ".sass") return "mdi:sass";
  if (ext === ".xml") return "mdi:xml";
  if (ext === ".md" || ext === ".markdown") return "mdi:language-markdown";

  // Data formats
  if (ext === ".json") return "mdi:code-json";
  if (ext === ".yaml" || ext === ".yml") return "mdi:file-code";
  if (ext === ".toml") return "mdi:file-code";
  if (ext === ".csv") return "mdi:file-delimited";
  if (ext === ".sql") return "mdi:database";

  // Images
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".gif" || ext === ".webp")
    return "mdi:file-image";
  if (ext === ".svg") return "mdi:svg";
  if (ext === ".ico") return "mdi:file-image";

  // Documents
  if (ext === ".pdf") return "mdi:file-pdf-box";
  if (ext === ".doc" || ext === ".docx") return "mdi:file-word";
  if (ext === ".xls" || ext === ".xlsx") return "mdi:file-excel";
  if (ext === ".ppt" || ext === ".pptx") return "mdi:file-powerpoint";
  if (ext === ".txt") return "mdi:file-document";

  // Archives
  if (ext === ".zip" || ext === ".tar" || ext === ".gz" || ext === ".7z" || ext === ".rar")
    return "mdi:folder-zip";

  // Config files
  if (
    ext === ".env" ||
    ext === ".gitignore" ||
    ext === ".gitattributes" ||
    ext === ".editorconfig"
  )
    return "mdi:file-cog";

  // Package/build files
  if (
    path.endsWith("package.json") ||
    path.endsWith("package-lock.json") ||
    path.endsWith("yarn.lock") ||
    path.endsWith("pnpm-lock.yaml")
  )
    return "mdi:npm";
  if (path.endsWith("Cargo.toml") || path.endsWith("Cargo.lock")) return "mdi:language-rust";
  if (path.endsWith("Makefile")) return "mdi:file-code";
  if (ext === ".dockerfile" || path.endsWith("Dockerfile")) return "mdi:docker";

  // Shell scripts
  if (ext === ".sh" || ext === ".bash" || ext === ".zsh") return "mdi:bash";
  if (ext === ".ps1") return "mdi:powershell";
  if (ext === ".bat" || ext === ".cmd") return "mdi:console";

  // Default
  return "mdi:file";
};

export const assertNever = (_: never): never => {
  throw new Error("This function must be unreachable");
};

export const shortHash = (value: string) => value.slice(0, 8);

export const getFileName = (fullpath: string): string => {
  const p = fullpath.lastIndexOf("/");
  return 0 <= p ? fullpath.slice(p + 1) : fullpath;
};

export const getExtension = (pathOrFileName: string): string => {
  const fileName = getFileName(pathOrFileName);
  const p = fileName.lastIndexOf(".");
  return 0 <= p ? fileName.slice(p) : "";
};

export const serializeError = (error: any): ErrorLike => ({
  name: error.name || "Unknown",
  message: error.message || `${error}`,
  stack: error.stack
});

export const toSlashedPath = (path: string) => path.replace("\\", "/");

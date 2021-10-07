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

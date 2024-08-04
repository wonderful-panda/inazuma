export const FileStatusList = ["?", "!", "M", "A", "D", "R", "C", "T", "U"] as const;
export type FileStatus = (typeof FileStatusList)[number];

export const isValidFileStatus = (value: string): value is FileStatus =>
  (FileStatusList as unknown as string[]).includes(value);

import { exec } from "./process";

export async function status(repoPath: string): Promise<FileEntry[]> {
    const ret: FileEntry[] = [];
    const { stdout } = await exec(repoPath, "status", ["-z"]);
    const values = stdout.split("\0");
    for (let i = 0; i < values.length; ++i) {
        const value = values[i];
        if (value.length === 0) {
            break;
        }
        if (value.length < 4) {
            console.log("status/unexpected output:", value);
            continue;
        }
        const statusCode = value.slice(0, 2);
        let path: string;
        let oldPath: string | undefined;
        if (statusCode[0] === "R") {
            // if renamed, next value is new path
            oldPath = value.slice(3);
            path = values[++i];
        }
        else {
            oldPath = undefined;
            path = value.slice(3);
        }
        if (statusCode[0] !== " " && statusCode !== "??") {
            ret.push({ path, oldPath, statusCode: statusCode[0], inIndex: true });
        }
        if (statusCode[1] !== " ") {
            ret.push({ path, statusCode: statusCode[1], inWorkingTree: true });
        }
    }
    return ret;
}

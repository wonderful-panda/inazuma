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
        let path = value.slice(3);
        if (statusCode[0] === "R") {
            // if renamed, next value is new path
            path = values[++i];
        }
        const inIndex = (statusCode[0] !== ' ' && statusCode !== "??");
        const inWorkingTree = (statusCode[1] !== ' ');
        ret.push({ path, status: 0, inWorkingTree, inIndex });
    };
    return ret;
}

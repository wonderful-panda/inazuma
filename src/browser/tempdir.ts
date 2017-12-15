import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";

export function setup() {
    const root = path.join(os.tmpdir(), "inazuma");
    if (!fs.existsSync(root)) {
        fs.mkdirSync(root);
    }
    const dirpath = fs.mkdtempSync(root + "/");
    return {
        path: dirpath,
        creanup() {
            try {
                rimraf.sync(dirpath);
            } catch (err) {
                console.log("Failed to cleanup temporary directory", err);
            }
        }
    };
}

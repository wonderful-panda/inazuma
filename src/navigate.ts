import { RawLocation } from "vue-router";

export class Navigator {
    constructor(public push: (loc: RawLocation) => void) {
    }

    log(repoPath: string) {
        this.push({ name: "log", params: { repoPath } });
    }
}


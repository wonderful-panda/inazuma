export function formatDate(value: Date): string {
    return `${value.getFullYear()}/${value.getMonth() + 1}/${value.getDate()}`;
}

export function stripDotGit(repoPath: string) {
    return repoPath.replace(/\/\.git(\/)$/, "");
};
export function getRepoName(repoPath: string) {
    return stripDotGit(repoPath).split("/").pop();
}

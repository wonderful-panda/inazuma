export interface Commit {
    id: string;
    parentIds: string[];
    summary: string;
    date: Date;
    author: string;
}

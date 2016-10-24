declare module "nodegit" {
    export class Oid {
        static fromString(id: string): Oid;
        cmp(b: Oid): number;
        cpy(): Oid;
        equal(b: Oid): number;
        iszero(): number;
    }

    export class Repository {
        static open(path: string): Promise<Repository>;
        path(): string;
        createRevWalk(id: String|Oid): Revwalk;
        getHeadCommit(): Promise<Commit>;
        getCommit(id: string|Oid): Commit;
        getReferences(type: Reference.TYPE): Promise<Reference[]>;
        getReferenceNames(type: Reference.TYPE): Promise<string[]>;
        getReferenceCommit(name: string|Reference): Promise<Commit>;
    }

    export class Signature {
        email(): string;
        name(): string;
    }

    export class Commit {
        author(): Signature;
        committer(): string;
        date(): Date;
        getParents(): Promise<Commit[]>;
        id(): Oid;
        message(): string;
        owner(): Repository;
        parent(n: number): Promise<Commit>;
        parentId(n: number): Oid;
        parentcount(): number;
        parents(callback: any): Oid[];
        summary(): string;
        sha(): string;
    }

    export class Reference {
        type(): Reference.TYPE;
        isBranch(): boolean;
        isConcrete(): boolean;
        isHead(): boolean;
        isNote(): boolean;
        isRemote(): boolean;
        isSymbolic(): boolean;
        isTag(): boolean;
        isValid(): boolean;
        name(): string;
        owner(): Repository;
        shorthand(): string;
    }

    export namespace Reference {
        export enum TYPE {
            INVALID = 0,
            OID = 1,
            SYMBOLIC = 2,
            LISTALL = 3
        }
    }


    export class Revwalk {
        static create(repo: Repository): Revwalk;
        getCommits(n: number): Promise<Commit[]>;
        getCommitsUntil(fn: (Commit) => boolean): Promise<Commit[]>;
        next(): Promise<Oid>;
        push(id: Oid): number;
        pushGlob(glob: string): number;
        pushHead(): number;
        pushRef(refname: string): number;
        repository(): Repository;
        reset(): void;
        sorting(sort: Revwalk.SORT): void;
    }

    export namespace Revwalk {
        export enum SORT {
            NONE = 0,
            TOPOLOGICAL = 1,
            TIME = 2,
            REVERSE = 4
        }
    }

}

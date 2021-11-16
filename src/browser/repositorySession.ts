import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as rimraf from "rimraf";

const tempdirRoot = path.join(os.tmpdir(), "inazuma");

export class RepositorySession {
  tempdir: string;
  constructor(public readonly repoPath: string) {
    const repoName = path.basename(this.repoPath);
    this.tempdir = fs.mkdtempSync(path.join(tempdirRoot, repoName));
  }

  close() {
    try {
      rimraf.sync(this.tempdir);
    } catch (err) {
      console.log("Failed to cleanup temporary directory", err);
    }
  }
}

export interface RepositorySessions {
  _map: Map<string, RepositorySession>;
  prepare(repoPath: string): RepositorySession;
  close(repoPath: string): void;
  dispose(): void;
}

export function setupRepositorySessions(): RepositorySessions {
  if (!fs.existsSync(tempdirRoot)) {
    fs.mkdirSync(tempdirRoot);
  }
  return {
    _map: new Map<string, RepositorySession>(),
    prepare(repoPath: string): RepositorySession {
      let session = this._map.get(repoPath);
      if (!session) {
        session = new RepositorySession(repoPath);
        this._map.set(repoPath, session);
      }
      return session;
    },
    close(repoPath: string) {
      const session = this._map.get(repoPath);
      if (session) {
        session.close();
        this._map.delete(repoPath);
      }
    },
    dispose() {
      for (const session of this._map.values()) {
        session.close();
        this._map.delete(session.repoPath);
      }
      this._map.clear();
    }
  };
}

export const repositorySessions = setupRepositorySessions();

import simpleGit, { SimpleGit } from "simple-git";

interface Branch {
  name: string;
  label: string;
  current: boolean;
}

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit();
  }

  async getAllBranches() {
    return await this.git.branch(["-vv"]);
  }

  async getMergedBranches() {
    return await this.git.branch(["--merged"]);
  }

  async getRemoteBranches() {
    return await this.git.branch(["-r"]);
  }

  async deleteLocalBranch(name: string, force: boolean = false) {
    return await this.git.deleteLocalBranch(name, force);
  }

  async deleteRemoteBranch(name: string) {
    return await this.git.push("origin", `:${name}`);
  }

  async getDeletableBranches(): Promise<Branch[]> {
    const branches = await this.getAllBranches();
    return Object.entries(branches.branches)
      .filter(([name, branch]) => 
        name !== 'master' && 
        name !== 'main' && 
        !branch.current
      )
      .map(([name, branch]) => ({
        name,
        label: branch.label,
        current: branch.current
      }));
  }
}

export const gitService = new GitService();

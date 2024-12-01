import { gitService } from "../services/GitService";
import { spinner } from "../utils/spinner";
import { logError, logSuccess, logWarning } from "../utils/console";
import chalk from "chalk";

export async function listStaleBranches(verbose: boolean) {
  spinner.start("Fetching stale branches...");
  try {
    const branches = await gitService.getAllBranches();
    spinner.stop();

    // Filter out current branch and find branches whose remote is gone
    const staleBranches = Object.entries(branches.branches).filter(
      ([_, branch]) =>
        branch.name !== branches.current && branch.label.includes(": gone")
    );

    if (staleBranches.length === 0) {
      logSuccess("No stale branches found!");
      return;
    }

    logWarning("Stale branches:");
    staleBranches.forEach(([name, branch]) => {
      console.log(`  - ${chalk.red(name)}`);
      if (verbose) {
        console.log(`    ${chalk.gray(branch.label)}`);
      }
    });
  } catch (error) {
    spinner.fail("Failed to fetch stale branches!");
    logError("Error fetching stale branches:", error);
  }
} 
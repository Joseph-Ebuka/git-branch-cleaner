import { gitService } from "../services/GitService";
import { spinner } from "../utils/spinner";
import { logError, logSuccess, logWarning } from "../utils/console";
import { confirmDelete } from "../utils/prompt";
import chalk from "chalk";
import { deleteStaleBranches } from "./delete";

export async function listMergedBranches(verbose: boolean, autoDelete: boolean) {
  spinner.start("Fetching merged branches...");
  try {
    const mergedBranches = await gitService.getMergedBranches();
    const currentBranch = mergedBranches.current;
    spinner.stop();

    const branchesToDelete = Object.entries(mergedBranches.branches).filter(
      ([name]) => 
        name !== 'master' && 
        name !== 'main' && 
        name !== currentBranch
    );

    if (branchesToDelete.length === 0) {
      logSuccess("No merged branches found to clean up!");
      return;
    }

    logWarning("Merged branches that can be deleted:");
    branchesToDelete.forEach(([name, branch]) => {
      console.log(`  - ${chalk.cyan(name)}`);
      if (verbose) {
        console.log(`    Last commit: ${chalk.gray(branch.label)}`);
      }
    });

    if (autoDelete || await confirmDelete(branchesToDelete.map(([name]) => name))) {
      await deleteStaleBranches(branchesToDelete.map(([name]) => name));
    }
  } catch (error) {
    spinner.fail("Failed to fetch merged branches!");
    logError("Error fetching merged branches:", error);
  }
} 
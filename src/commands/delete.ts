import { gitService } from "../services/GitService";
import { spinner } from "../utils/spinner";
import { logError, logWarning, logSuccess } from "../utils/console";
import { confirmDelete, selectBranches } from "../utils/prompt";
import chalk from "chalk";

export async function deleteStaleBranches(
  branchNames: string[],
  force: boolean = false
) {
  spinner.start("Deleting branches...");
  try {
    for (const name of branchNames) {
      if (name === "master" || name === "main") {
        logWarning(`Skipping protected branch: ${name}`);
        continue;
      }
      await gitService.deleteLocalBranch(name, force);
      console.log(chalk.red(`Deleted branch: ${name}` + chalk.gray("✨")));
    }
    spinner.succeed("Successfully deleted branches!");
  } catch (error) {
    spinner.fail("Failed to delete branches!");
    logError("Error deleting branches:", error);
  }
}

export async function deleteInteractiveBranches(force: boolean = false) {
  spinner.start("Fetching branches...");
  try {
    const branches = await gitService.getDeletableBranches();
    spinner.stop();

    if (branches.length === 0) {
      logSuccess("No branches available to delete!");
      return;
    }

    const selectedBranches = await selectBranches(branches);

    if (selectedBranches.length === 0) {
      logWarning("No branches selected for deletion.");
      return;
    }

    if (force || await confirmDelete(selectedBranches)) {
      await deleteStaleBranches(selectedBranches, force);
    }
  } catch (error) {
    spinner.fail("Failed to fetch branches!");
    logError("Error fetching branches:", error);
  }
} 
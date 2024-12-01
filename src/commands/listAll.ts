import { gitService } from "../services/GitService";
import { spinner } from "../utils/spinner";
import { logError, logSuccess, logInfo } from "../utils/console";
import chalk from "chalk";

export async function listAllBranches() {
  spinner.start("Fetching all branches...");
  try {
    const branches = await gitService.getAllBranches();
    if (branches.all.length === 0) {
      spinner.stop();
      logSuccess("No branches found!");
      return;
    }
    spinner.stop();

    logInfo("All branches:");
    Object.entries(branches.branches).forEach(([name, branch]) => {
      const currentMarker = branch.current ? chalk.green("*") : " ";
      const branchColor = branch.label.includes(": gone") ? chalk.red : chalk.gray;
      console.log(`  ${currentMarker} ${branchColor(name)}`);
    });
  } catch (error) {
    spinner.fail("Failed to fetch all branches!");
    logError("Error fetching all branches:", error);
  }
} 
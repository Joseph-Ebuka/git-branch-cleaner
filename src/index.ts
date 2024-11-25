#!/usr/bin/env node

/**
 * Git Branch Cleaner
 * A CLI tool to help clean up stale git branches
 */

import { Command } from "commander";
import simpleGit, { SimpleGit } from "simple-git";
import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";

// Initialize core dependencies
const program = new Command();
const git: SimpleGit = simpleGit();
const spinner = ora();

/**
 * Lists and optionally deletes stale git branches
 * @param verbose - Whether to show detailed branch information
 * @param dryRun - If true, only lists branches without deleting
 * @param autoDelete - If true, deletes branches without confirmation
 */
async function listStaleBranches(
  verbose: boolean,
  dryRun: boolean,
  autoDelete: boolean
) {
  spinner.start("Fetching branches...");
  try {
    // Get all branches with verbose info
    const branches = await git.branch(["-vv"]);
    spinner.stop(); // Stop spinner after fetch

    // Filter out current branch and find branches whose remote is gone
    const staleBranches = Object.entries(branches.branches).filter(
      ([_, branch]) =>
        branch.name !== branches.current && branch.label.includes(": gone")
    );

    // Early return if no stale branches found
    if (staleBranches.length === 0) {
      console.log(chalk.green("No stale branches found!"));
      return;
    }

    // Display stale branches
    console.log(chalk.yellow("Stale branches:"));
    staleBranches.forEach(([name]) => {
      console.log(`  - ${chalk.red(name)}`);
      if (verbose) {
        console.log(`    ${chalk.gray(branches.branches[name].label)}`);
      }
    });

    // Handle different modes
    if (dryRun) {
      console.log(chalk.yellow("Dry run mode: No branches will be deleted."));
      return;
    }

    if (autoDelete) {
      await deleteStaleBranches(staleBranches.map(([name]) => name));
      return;
    }

    // Delete branches after confirmation
    if (await confirmDelete(staleBranches.map(([name]) => name))) {
      await deleteStaleBranches(staleBranches.map(([name]) => name));
    }
  } catch (error: unknown) {
    spinner.fail("Failed to fetch branches!");
    if (error instanceof Error) {
      console.error(chalk.red("Error fetching branches:"), error.message);
    } else {
      console.error(chalk.red("Error fetching branches:"), String(error));
    }
  }
}

/**
 * Deletes the specified git branches
 * @param branchNames - Array of branch names to delete
 * @param force - If true, forces deletion even if branch is not fully merged
 */
async function deleteStaleBranches(
  branchNames: string[],
  force: boolean = false
) {
  spinner.start("Deleting branches...");
  try {
    for (const name of branchNames) {
      // Protect master and main branches
      if (name === "master" || name === "main") {
        console.log(chalk.yellow(`Skipping protected branch: ${name}`));
        continue;
      }
      await git.deleteLocalBranch(name, force);
      console.log(chalk.red(`Deleted branch: ${name}`));
    }
    spinner.succeed("Successfully deleted stale branches!");
  } catch (error: unknown) {
    spinner.fail("Failed to delete stale branches!");
    if (error instanceof Error) {
      console.error(chalk.red("Error deleting branches:"), error.message);
    } else {
      console.error(chalk.red("Error deleting branches:"), String(error));
    }
  }
}

/**
 * Prompts user for confirmation before deleting branches
 * @param branchNames - Array of branch names to be deleted
 * @returns boolean indicating whether user confirmed deletion
 */
async function confirmDelete(branchNames: string[]): Promise<boolean> {
  if (branchNames.length === 0) return false;

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to delete ${branchNames.length} stale branches?`,
      default: false,
    },
  ]);

  return confirm;
}

async function deleteRemoteBranches(branchNames: string[]) {
  spinner.start("Deleting remote branches...");
  try {
    for (const name of branchNames) {
      // Protect master and main branches
      if (name === "origin/master" || name === "origin/main") {
        console.log(chalk.yellow(`Skipping protected remote branch: ${name}`));
        continue;
      }
      await git.push("origin", `:${name}`);
      console.log(chalk.red(`Deleted remote branch: ${name}`));
    }
    spinner.succeed("Successfully deleted remote branches!");
  } catch (error: unknown) {
    spinner.fail("Failed to delete remote branches!");
    if (error instanceof Error) {
      console.error(
        chalk.red("Error deleting remote branches:"),
        error.message
      );
    } else {
      console.error(
        chalk.red("Error deleting remote branches:"),
        String(error)
      );
    }
  }
}

/**
 * Lists and optionally deletes stale remote git branches
 * @param autoDelete - If true, deletes branches without confirmation
 */
async function listStaleRemoteBranches(autoDelete: boolean) {
  spinner.start("Fetching remote branches...");
  try {
    // Fetch all remote branches
    const remoteBranches = await git.branch(["-r"]);
    spinner.stop();

    // Filter out branches that are merged into the main branch and exclude main/master
    const staleRemoteBranches = Object.entries(remoteBranches.branches).filter(
      ([name]) =>
        name.includes("origin/") &&
        !name.includes("origin/main") &&
        !name.includes("origin/master")
    );

    if (staleRemoteBranches.length === 0) {
      console.log(chalk.green("No stale remote branches found!"));
      return;
    }

    console.log(chalk.yellow("Stale remote branches:"));
    staleRemoteBranches.forEach(([name]) => {
      console.log(`  - ${chalk.red(name)}`);
    });

    if (autoDelete) {
      await deleteRemoteBranches(staleRemoteBranches.map(([name]) => name));
      return;
    }

    if (await confirmDelete(staleRemoteBranches.map(([name]) => name))) {
      await deleteRemoteBranches(staleRemoteBranches.map(([name]) => name));
    }
  } catch (error: unknown) {
    spinner.fail("Failed to fetch remote branches!");
    if (error instanceof Error) {
      console.error(
        chalk.red("Error fetching remote branches:"),
        error.message
      );
    } else {
      console.error(
        chalk.red("Error fetching remote branches:"),
        String(error)
      );
    }
  }
}

/**
 * Lists all git branches in the repository, highlighting stale branches in red
 * and others in gray.
 */
async function listAllBranches() {
  spinner.start("Fetching all branches...");
  try {
    // Get all branches with verbose info to identify stale branches
    const branches = await git.branch(["-vv"]);
    if (branches.all.length === 0) {
      spinner.stop(); 
      console.log(chalk.green("No branches found!"));
      return;
    }
    spinner.stop();

    // Display all branches
    console.log(chalk.blue("All branches:"));
    Object.entries(branches.branches).forEach(([name, branch]) => {
      const currentMarker = branch.current ? chalk.green("*") : " ";
      const branchColor = branch.label.includes(": gone") ? chalk.red : chalk.gray;
      console.log(`  ${currentMarker} ${branchColor(name)}`);
    });
  } catch (error: unknown) {
    spinner.fail("Failed to fetch all branches!");
    if (error instanceof Error) {
      console.error(chalk.red("Error fetching all branches:"), error.message);
    } else {
      console.error(chalk.red("Error fetching all branches:"), String(error));
    }
  }
}

// CLI Configuration
program
  .name("git-branch-cleaner")
  .description("CLI tool to clean up stale Git branches")
  .version("1.0.0");

// List command
program
  .command("list")
  .description("List stale branches")
  .option("-v, --verbose", "Verbose output")
  .option("--dry-run", "Dry run mode: list branches without deleting")
  .option("--auto-delete", "Automatically delete branches after listing")
  .action(async (options) => {
    await listStaleBranches(
      options.verbose,
      options.dryRun,
      options.autoDelete
    );
  });

// Delete command
program
  .command("delete")
  .description("Delete stale branches")
  .option("-f, --force", "Force delete branches without confirmation")
  .action(async (options) => {
    const branches = await git.branch(["-vv"]);
    const staleBranches = Object.entries(branches.branches).filter(
      ([_, branch]) =>
        branch.name !== branches.current && branch.label.includes(": gone")
    );

    if (staleBranches.length === 0) {
      console.log(chalk.green("No stale branches to ") + chalk.red("delete!"));
      return;
    }

    if (
      options.force ||
      (await confirmDelete(staleBranches.map(([name]) => name)))
    ) {
      await deleteStaleBranches(
        staleBranches.map(([name]) => name),
        options.force
      );
    }
  });

// Add a new command to the CLI for cleaning up remote branches
program
  .command("clean-remote")
  .description("Clean up stale remote branches")
  .option("--auto-delete", "Automatically delete branches after listing")
  .action(async (options) => {
    await listStaleRemoteBranches(options.autoDelete);
  });

// Add a new command to the CLI for listing all branches
program
  .command("list-all")
  .description("List all branches in the repository")
  .action(async () => {
    await listAllBranches();
  });

program.parse(process.argv);

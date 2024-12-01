#!/usr/bin/env node

import { Command } from "commander";
import { listAllBranches } from "./commands/listAll";
import { listMergedBranches } from "./commands/cleanMerged";
import { deleteStaleBranches, deleteInteractiveBranches } from "./commands/delete";
import { listStaleBranches } from "./commands/listStale";

const program = new Command();

// CLI Configuration
program
  .name("git-branch-cleaner")
  .description("CLI tool to clean up  Git branches")
  .version("1.0.0");

program
  .command("list-all")
  .description("List all branches in the repository")
  .action(listAllBranches);

program
  .command("clean-merged")
  .description("List and clean up merged branches")
  .option("-v, --verbose", "Show detailed branch information")
  .option("--auto-delete", "Automatically delete branches after listing")
  .action(async (options) => {
    await listMergedBranches(options.verbose, options.autoDelete);
  });

program
  .command("delete")
  .description("Delete branches")
  .option("--force", "Force delete branches")
  .argument("[branch...]", "Branch names to delete (optional)")
  .action(async (branchNames, options) => {
    if (branchNames && branchNames.length > 0) {
      await deleteStaleBranches(branchNames, options.force);
    } else {
      await deleteInteractiveBranches(options.force);
    }
  });

program
  .command("list-stale")
  .description("List stale branches (branches with deleted remotes)")
  .option("-v, --verbose", "Show detailed branch information")
  .action(async (options) => {
    await listStaleBranches(options.verbose);
  });

program.parse(process.argv);

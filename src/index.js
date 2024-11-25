#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const simple_git_1 = __importDefault(require("simple-git"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const program = new commander_1.Command();
const git = (0, simple_git_1.default)();
const spinner = (0, ora_1.default)();
// List stale branches
function listStaleBranches(verbose, dryRun, autoDelete) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            spinner.start();
            const branches = yield git.branch(['-vv']);
            const staleBranches = Object.entries(branches.branches).filter(([_, branch]) => branch.name !== branches.current && branch.label.includes(': gone'));
            if (staleBranches.length === 0) {
                console.log(chalk_1.default.green('No stale branches found!'));
                return;
            }
            console.log(chalk_1.default.yellow('Stale branches:'));
            staleBranches.forEach(([name]) => {
                console.log(`  - ${chalk_1.default.red(name)}`);
                if (verbose) {
                    console.log(`    ${chalk_1.default.gray(branches.branches[name].label)}`);
                }
            });
            if (dryRun) {
                console.log(chalk_1.default.yellow('Dry run mode: No branches will be deleted.'));
                return;
            }
            if (autoDelete) {
                yield deleteStaleBranches(staleBranches.map(([name]) => name));
                return;
            }
            if (yield confirmDelete(staleBranches.map(([name]) => name))) {
                yield deleteStaleBranches(staleBranches.map(([name]) => name));
            }
            spinner.succeed("Successfully deleted stale branches!");
        }
        catch (error) {
            spinner.fail("Failed to fetch branches!");
            if (error instanceof Error) {
                console.error(chalk_1.default.red('Error fetching branches:'), error.message);
            }
            else {
                console.error(chalk_1.default.red('Error fetching branches:'), String(error));
            }
        }
    });
}
// Delete stale branches
function deleteStaleBranches(branchNames_1) {
    return __awaiter(this, arguments, void 0, function* (branchNames, force = false) {
        try {
            spinner.start();
            for (const name of branchNames) {
                yield git.deleteLocalBranch(name, force);
                console.log(chalk_1.default.red(`Deleted branch: ${name}`));
            }
            spinner.succeed("Successfully deleted stale branches!");
        }
        catch (error) {
            spinner.fail("Failed to delete stale branches!");
            if (error instanceof Error) {
                console.error(chalk_1.default.red('Error deleting branches:'), error.message);
            }
            else {
                console.error(chalk_1.default.red('Error deleting branches:'), String(error));
            }
        }
    });
}
// Confirm before deleting branches
function confirmDelete(branchNames) {
    return __awaiter(this, void 0, void 0, function* () {
        if (branchNames.length === 0)
            return false;
        const { confirm } = yield inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Are you sure you want to delete ${branchNames.length} stale branches?`,
                default: false,
            },
        ]);
        return confirm;
    });
}
// Set up CLI commands
program
    .name('git-branch-cleaner')
    .description('CLI tool to clean up stale Git branches')
    .version('1.0.0');
program
    .command('list')
    .description('List stale branches')
    .option('-v, --verbose', 'Verbose output')
    .option('--dry-run', 'Dry run mode: list branches without deleting')
    .option('--auto-delete', 'Automatically delete branches after listing')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    yield listStaleBranches(options.verbose, options.dryRun, options.autoDelete);
}));
program
    .command('delete')
    .description('Delete stale branches')
    .option('-f, --force', 'Force delete branches without confirmation')
    .action((options) => __awaiter(void 0, void 0, void 0, function* () {
    const branches = yield git.branch(['-vv']);
    const staleBranches = Object.entries(branches.branches).filter(([_, branch]) => branch.name !== branches.current && branch.label.includes(': gone'));
    if (staleBranches.length === 0) {
        console.log(chalk_1.default.green('No stale branches to delete!'));
        return;
    }
    if (options.force || (yield confirmDelete(staleBranches.map(([name]) => name)))) {
        yield deleteStaleBranches(staleBranches.map(([name]) => name), options.force);
    }
}));
program.parse(process.argv);

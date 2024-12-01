import inquirer from "inquirer";

export async function confirmDelete(branchNames: string[]): Promise<boolean> {
  if (branchNames.length === 0) return false;

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to delete ${branchNames.length} branches?`,
      default: false,
    },
  ]);

  return confirm;
}

export async function selectBranches(branches: { name: string; label: string }[]): Promise<string[]> {
  if (branches.length === 0) return [];

  const { selectedBranches } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedBranches',
      message: 'Select branches to delete (use spacebar to select/unselect):',
      choices: branches.map(branch => ({
        name: `${branch.name} ${branch.label}`,
        value: branch.name,
        short: branch.name
      })),
      pageSize: 10
    }
  ]);

  return selectedBranches;
} 
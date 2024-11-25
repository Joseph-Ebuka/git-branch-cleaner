# Git Branch Cleaner

Git Branch Cleaner is a command-line interface (CLI) tool designed to help developers clean up stale git branches both locally and remotely. It provides options to list, delete, and automatically manage branches that are no longer needed.

## Features

- **List Stale Branches**: Identify branches that are no longer active or have been merged.
- **List All Branches**: List all branches in the repository.
- **Delete Stale Branches**: Remove branches that are no longer needed.
- **Dry Run Mode**: Preview which branches would be deleted without actually removing them.
- **Automatic Deletion**: Automatically delete branches without manual confirmation.
- **Remote Branch Management**: Clean up stale branches on the remote repository.

## Installation

To install Git Branch Cleaner, you need to have Node.js and npm installed on your machine. Follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Joseph-Ebuka/git-branch-cleaner.git
   cd git-branch-cleaner
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Link the CLI Tool**:  
   ```bash
   npm link
   ```
##### OR 
```bash
npm run build
npm install -g 
```

This will make the `git-branch-cleaner` command available globally on your system.

## Usage

Once installed, you can use the `git-branch-cleaner` command to manage your git branches.

### List Stale Branches

To list stale branches, use the following command:

```bash
git-branch-cleaner list
```

Options:
- `-v, --verbose`: Show detailed branch information.
- `--dry-run`: List branches without deleting them.
- `--auto-delete`: Automatically delete branches after listing.

### Delete Stale Branches

To delete stale branches, use the following command:

```bash
git-branch-cleaner delete
```

Options:
- `-f, --force`: Force delete branches without confirmation.

### Clean Up Remote Branches

To clean up stale remote branches, use the following command:

```bash
git-branch-cleaner clean-remote
```

Options:
- `--auto-delete`: Automatically delete branches after listing.

### List All Branches

To list all branches in the repository, use the following command:

```bash
git-branch-cleaner list-all
```

- Stale branches are highlighted in red.
- Other branches are displayed in gray.
- The current branch is marked with an asterisk (`*`) in green.

## Contributing

Contributions are welcome! Please fork or clone the repository and submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/license/mit) file for details.

## Contact

For any questions or feedback, please contact ebukaj665@gmail.com 


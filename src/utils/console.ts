import chalk from "chalk";

export const logError = (message: string, error: unknown) => {
  if (error instanceof Error) {
    console.error(chalk.red(message), error.message);
  } else {
    console.error(chalk.red(message), String(error));
  }
};

export const logSuccess = (message: string) => {
  console.log(chalk.green(message));
};

export const logWarning = (message: string) => {
  console.log(chalk.yellow(message));
};

export const logInfo = (message: string) => {
  console.log(chalk.blue(message));
}; 
import chalk from "chalk";
export const logger = {
  info: (message: string) => {
    console.log(chalk.blue("[INFO]"), message);
  },
  success: (message: string) => {
    console.log(chalk.green("[SUCCESS]"), message);
  },
  warning: (message: string) => {
    console.log(chalk.yellow("[WARNING]"), message);
  },
  error: (message: string) => {
    console.error(chalk.red("[ERROR]"), message);
  },
};

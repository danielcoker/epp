import chalk from 'chalk';
import ora from 'ora';
import readline from 'readline';

const brandColor = 'ffc602';

const withBrand = (str: string) => {
  return chalk.hex(brandColor).bold(str);
};

const withWarning = (str: string) => {
  return `⚠️ ${chalk.yellow(str)}`;
};

const withCaret = (str: string) => {
  return `${chalk.gray('>')} ${str}`;
};

const withCheck = (str: string) => {
  return `${chalk.green('✔')} ${str}`;
};

const withX = (str: string) => {
  return `${chalk.red.bold('✕')} ${str}`;
};

const spinner = (str: string) => {
  return ora({
    text: str,
    color: 'blue',
    spinner: {
      interval: 120,
      frames: ['-', '+', '-'],
    },
  });
};

/**
 *
 * Logs a branded yellow message to stdout.
 * @param {String} msg
 */
const branded = (msg: string) => {
  console.log(chalk.hex(brandColor).bold(msg));
};

/**
 * Clears the line and optionally log a message to stdout.
 * @param {string} msg
 */
const clearLine = (msg?: string) => {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  msg && process.stdout.write(msg);
};

/**
 * Logs a yellow warning message to stdout.
 * @param {string} msg
 */
const warning = (msg: string) => {
  console.log(withCaret(withWarning(msg)));
};

/**
 * Logs a red error message to stderr.
 * @param {string} msg
 */
const error = (msg: string) => {
  console.error(withX(chalk.red.bold(msg)));
};

/**
 * Logs a subtle gray message to stdout.
 * @param {string} msg
 */
const meta = (msg: string) => {
  console.log(withCaret(chalk.gray(msg)));
};

/**
 * Logs a progress message to stdout.
 * @param {string} msg
 */
const progress = (msg: string) => {
  console.log(withCaret(chalk.bold(msg)));
};

/**
 * Logs a bold info message to stdout.
 * @param msg
 */
const info = (msg: string) => {
  console.log(chalk.bold(msg));
};

/**
 * Logs a green success message to stdout.
 * @param {string} msg
 */
const success = (msg: string) => {
  console.log(withCheck(chalk.green(msg)));
};

/**
 * Creates a new line.
 */
const newline = () => {
  console.log(' ');
};

/**
 * Colorizes a variable for display.
 * @param {string} val
 */
const variable = (val: any) => {
  return chalk.cyan.bold(`${val}`);
};

export const log = {
  withBrand,
  withWarning,
  withCaret,
  withCheck,
  withX,
  spinner,
  branded,
  clearLine,
  warning,
  error,
  meta,
  progress,
  info,
  success,
  newline,
  variable,
};

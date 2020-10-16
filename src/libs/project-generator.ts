import spawn from 'cross-spawn';
import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { readJsonSync, writeJsonSync } from 'fs-extra';
import chalk from 'chalk';
import { log } from './display';

export interface ProjectGeneratorOptions {
  destinationRoot: string;
  name: string;
  description: string;
  author: string;
  skipInstall: boolean | string;
  repository: string;
}

export class ProjectGenerator {
  constructor(private options: ProjectGeneratorOptions) {
    this.options.destinationRoot = path.join(this.options.name!);
    this.options.skipInstall = this.options.skipInstall === 'yes';
  }

  createProjectDir() {
    if (!existsSync(this.options.destinationRoot)) mkdirSync(this.options.destinationRoot);
  }

  async cloneRepo() {
    const cloningSpinner = log.spinner(log.withBrand('Setting up project')).start();

    spawn.sync(
      'git',
      ['clone', 'https://github.com/danielcoker/node-express-boilerplate.git', '.'],
      { stdio: 'ignore' },
    );

    // Remove .git
    spawn.sync('rm', ['-rf', '.git']);

    cloningSpinner.succeed();
  }

  async updatePackageInfo() {
    const packageFile = path.join('package.json');

    try {
      const pkg = readJsonSync(packageFile);

      pkg.name = this.options.name;
      pkg.repository.type = undefined;
      pkg.repository.url = this.options.repository;
      pkg.author = this.options.author;
      pkg.description = this.options.description;

      pkg.bugs = undefined;
      pkg.homepage = undefined;

      await writeJsonSync(packageFile, pkg, { spaces: 2 });

      return true;
    } catch (error) {
      console.error(error);
      log.error('Unable to read package.json');

      return false;
    }
  }

  async postWrite() {
    const gitInitResult = spawn.sync('git', ['init'], { stdio: 'ignore' });

    await this.updatePackageInfo();

    if (!this.options.skipInstall) {
      const installingSpinner = log.spinner(log.withBrand('Installing dependencies')).start();

      // Run `npm install`
      const installPackageCommand = spawn.sync('npm', ['install']);

      if (installPackageCommand.status === 0) {
        installingSpinner.succeed();
      } else {
        installingSpinner.fail(
          chalk.red.bold(
            "We had some trouble connecting to the network. We'll skip installing dependencies now. Make sure to run `npm install` once you're connected again.",
          ),
        );
      }
    }

    if (gitInitResult.status === 0) {
      this.commitChanges();
    } else {
      log.warning('Failed to run git init.');
      log.warning('Find out more about how to install git here: https://git-scm.com/downloads.');
    }
  }

  commitChanges() {
    const commands: Array<[string, string[], object]> = [
      ['git', ['add', '.'], { stdio: 'ignore' }],
      ['git', ['commit', '-m', 'Initial commit'], { stdio: 'ignore' }],
    ];

    for (const command of commands) {
      const result = spawn.sync(...command);
      if (result.status !== 0) {
        log.error(`Failed to run command ${command[0]} with ${command[1].join(' ')} options.`);
        break;
      }
    }
  }

  async run() {
    // Create the project directory.
    this.createProjectDir();

    // cd into the created project directory.
    process.chdir(this.options.name);

    // Clone the boilerplate repo.
    await this.cloneRepo();

    // Operations after creating project.
    await this.postWrite();
  }
}

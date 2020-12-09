import spawn from 'cross-spawn';
import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { readJson, writeJson, readFile, outputFile } from 'fs-extra';
import { parse, stringify } from 'envfile';
import chalk from 'chalk';
import { log } from './display';
import { randomString } from './strings';

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

    const updatingPackageSpinner = log.spinner(log.withBrand('Updating package.json')).start();

    try {
      const pkg = await readJson(packageFile);

      pkg.name = this.options.name;
      pkg.repository.type = undefined;
      pkg.repository.url = this.options.repository;
      pkg.author = this.options.author;
      pkg.description = this.options.description;

      pkg.bugs = undefined;
      pkg.homepage = undefined;

      await writeJson(packageFile, pkg, { spaces: 2 });

      updatingPackageSpinner.succeed();

      return true;
    } catch (error) {
      updatingPackageSpinner.fail('Unable to read package.json');

      return false;
    }
  }

  async updateReadme() {
    const cwd = process.cwd();
    const readmePath = path.resolve(cwd, 'README.md');

    let readme = await readFile(readmePath, 'utf8');
    readme = this.replaceTag(readme, 'intro', this.introText());

    readme = readme.trimRight();
    readme += '\n';

    await outputFile(readmePath, readme);
  }

  async updateEnvInfo() {
    const updateEnvSpinner = log.spinner(log.withBrand('Updating env variables')).start();

    const cwd = process.cwd();
    const envPath = path.resolve(cwd, '.env');

    const envFile: string = await readFile(envPath, 'utf8');
    const env: any = parse(envFile);

    env.APP_NAME = this.options.name;
    env.NODE_ENV = 'development';

    env.LOG_LEVEL += '\n';
    env.DB_TEST_URL += '\n';

    env.JSON_WEB_TOKEN_SECRET = randomString(40);
    env.JSON_WEB_TOKEN_EXPIRE = '30d';

    await outputFile(envPath, stringify(env));

    updateEnvSpinner.succeed();
  }

  async postWrite() {
    const gitInitResult = spawn.sync('git', ['init'], { stdio: 'ignore' });

    await this.updatePackageInfo();

    await this.updateReadme();

    // Copy .env.example to .env
    spawn.sync('cp', ['.env.example', '.env'], { stdio: 'ignore' });

    await this.updateEnvInfo();

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

  replaceTag(readme: string, tag: string, body: string): string {
    const updateReadmeSpinner = log.spinner(log.withBrand('Updating README.md')).start();

    if (readme.includes(`<!-- ${tag} -->`)) {
      if (readme.includes(`<!-- ${tag}stop -->`)) {
        readme = readme.replace(
          new RegExp(`<!-- ${tag} -->(.|\n)*<!-- ${tag}stop -->`, 'm'),
          `<!-- ${tag} -->`,
        );
      }
    }

    updateReadmeSpinner.succeed();

    return readme.replace(`<!-- ${tag} -->`, `<!-- ${tag} -->\n${body}\n<!-- ${tag}stop -->`);
  }

  introText() {
    return `# ${this.options.name}\n\n${this.options.description}\n`.trim();
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

import spawn from 'cross-spawn';
import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { readJson, writeJson, readFile, outputFile } from 'fs-extra';
import { parse, stringify } from 'envfile';
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
  constructor(public options: ProjectGeneratorOptions) {
    this.options.destinationRoot = path.join(this.options.name!);
    this.options.skipInstall = this.options.skipInstall === 'yes';
  }

  createProjectDir() {
    if (!existsSync(this.options.destinationRoot)) mkdirSync(this.options.destinationRoot);
  }

  async cloneRepo() {
    spawn.sync(
      'git',
      ['clone', 'https://github.com/danielcoker/node-express-boilerplate.git', '.'],
      { stdio: 'ignore' },
    );

    // Remove .git
    spawn.sync('rm', ['-rf', '.git']);
  }

  async updatePackageInfo() {
    const packageFile = path.join('package.json');

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

      return true;
    } catch (error) {
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
    if (readme.includes(`<!-- ${tag} -->`)) {
      if (readme.includes(`<!-- ${tag}stop -->`)) {
        readme = readme.replace(
          new RegExp(`<!-- ${tag} -->(.|\n)*<!-- ${tag}stop -->`, 'm'),
          `<!-- ${tag} -->`,
        );
      }
    }

    return readme.replace(`<!-- ${tag} -->`, `<!-- ${tag} -->\n${body}\n<!-- ${tag}stop -->`);
  }

  introText() {
    return `# ${this.options.name}\n\n${this.options.description}\n`.trim();
  }
}

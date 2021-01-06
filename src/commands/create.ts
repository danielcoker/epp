import { Command } from '@oclif/command';

import { prompt } from 'inquirer';
import chalk from 'chalk';
import Listr from 'listr';
import spawn from 'cross-spawn';

import { log } from '../libs/display';
import { ProjectGenerator, ProjectGeneratorOptions } from '../libs/project-generator';

export default class Create extends Command {
  static description = 'Creates a new Express project.';

  static aliases = ['c'];

  static args = [
    {
      name: 'name',
      required: false,
      description: 'The name of the Express project.',
    },
  ];

  async run() {
    const { args } = this.parse(Create);

    const question = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter your project name',
        default: args.name,
        validate: (v: any) => (v ? true : 'Project name is required'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter your project description',
      },
      {
        type: 'input',
        name: 'author',
        message: 'Enter your project author',
      },
      {
        type: 'input',
        name: 'repository',
        message: 'Enter you project repository',
      },
      {
        type: 'list',
        name: 'skipInstall',
        message: 'Skip package installation?',
        choices: ['yes', 'no'],
      },
    ];

    const answers = await prompt<ProjectGeneratorOptions>(question);
    const generator = new ProjectGenerator(answers);

    this.log('\n' + log.withBrand('Hang tight while we set up your new Express app!') + '\n');

    const tasks = new Listr([
      {
        title: 'Creating Project Direcotory',
        task: () => {
          generator.createProjectDir();

          // cd into the created project directory.
          process.chdir(generator.options.name);
        },
      },
      {
        title: 'Cloning Repo',
        task: async () => {
          await generator.cloneRepo();
        },
      },
      {
        title: 'Initializing Git Repo',
        task: (ctx, task) => {
          try {
            spawn.sync('git', ['init'], { stdio: 'ignore' });
          } catch (error) {
            task.skip('Failed to run git init');
          }
        },
      },
      {
        title: 'Updating package.json',
        task: async () => {
          await generator.updatePackageInfo();
        },
      },
      {
        title: 'Updating README.md',
        task: async () => {
          await generator.updateReadme();
        },
      },
      {
        title: 'Updating env Variables',
        task: async () => {
          spawn.sync('cp', ['.env.example', '.env'], { stdio: 'ignore' });
          await generator.updateEnvInfo();
        },
      },
      {
        title: 'Installing Dependencies',
        skip: () => {
          if (generator.options.skipInstall) {
            return 'Skipped dependency installation';
          }
        },
        task: (ctx, task) => {
          try {
            spawn.sync('npm', ['install']);
          } catch (error) {
            task.skip(
              "We had some trouble connecting to the network. We'll skip installing dependencies now. Make sure to run `npm install` once you're connected again.",
            );
          }
        },
      },
      {
        title: 'Commiting Changes',
        task: () => {
          generator.commitChanges();
        },
      },
    ]);

    await tasks.run();

    this.log('\n' + log.withBrand('Your new Express app is ready! Next steps:') + '\n');
    this.log('- Go inside your project folder');
    this.log(log.withCaret(chalk.bold.blue(`cd ${answers.name}`)));
    this.log(
      `- Open ${chalk.bold.blue('README.md')} file and follow the ${chalk.bold.blue(
        'Getting Started',
      )} guide.`,
    );
  }
}

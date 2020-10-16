import { Command } from '@oclif/command';
import chalk from 'chalk';
import { prompt } from 'enquirer';
import { log } from '../libs/display';
import { ProjectGenerator, ProjectGeneratorOptions } from '../libs/project-generator';

export default class Create extends Command {
  static description = 'Creates a new Express project.';

  static aliases = ['c'];

  async run() {
    const question = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter your project name',
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
        type: 'select',
        name: 'skipInstall',
        message: 'Skip package installation?',
        choices: ['yes', 'no'],
      },
    ];

    const answers = await prompt<ProjectGeneratorOptions>(question);
    const generator = new ProjectGenerator(answers);

    try {
      this.log('\n' + log.withBrand('Hang tight while we set up your new Express app!') + '\n');
      await generator.run();

      this.log('\n' + log.withBrand('Your new Express app is ready! Next steps:') + '\n');
      this.log('- Go inside your project folder');
      this.log(log.withCaret(chalk.bold.blue(`cd ${answers.name}`)));
      this.log(`- Open ${chalk.bold.blue('README.md')} file and follow the getting started guide.`);
    } catch (error) {
      this.error(error);
    }
  }
}

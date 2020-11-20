# epp

CLI tool to create Express projects.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@danielcoker/epp.svg)](https://npmjs.org/package/@danielcoker/epp)
[![Downloads/week](https://img.shields.io/npm/dw/@danielcoker/epp.svg)](https://npmjs.org/package/@danielcokerepp)
[![License](https://img.shields.io/npm/l/epp.svg)](https://github.com/danielcoker/epp/blob/master/package.json)

<!-- toc -->

- [epp](#epp)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @danielcoker/epp
$ epp COMMAND
running command...
$ epp (-v|--version|version)
@danielcoker/epp/0.1.1 win32-x64 node-v12.16.0
$ epp --help [COMMAND]
USAGE
  $ epp COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`epp create [NAME]`](#epp-create-name)
- [`epp help [COMMAND]`](#epp-help-command)

## `epp create [NAME]`

Creates a new Express project.

```
USAGE
  $ epp create [NAME]

ARGUMENTS
  NAME  The name of the Express project.

ALIASES
  $ epp c
```

_See code: [src\commands\create.ts](https://github.com/danielcoker/epp/blob/v0.1.1/src\commands\create.ts)_

## `epp help [COMMAND]`

display help for epp

```
USAGE
  $ epp help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src\commands\help.ts)_

<!-- commandsstop -->

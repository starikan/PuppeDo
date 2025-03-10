# PuppeDo

Puppeteer tests flow with node.js


# Installation

## Windows

  1. Install [NodeJS](https://nodejs.org/)

      * you can use [Nodist](https://github.com/nullivex/nodist/)

  1. Fetch node modules with `npm install` or `yarn`
  1. Install Playwright browsers with `npx playwright install` if you want to run tests on playwright browsers
  1. Run tests

## Generate project

For start new project use [PuppeDoCLI](https://github.com/starikan/PuppeDoCLI)


# Project structure

All files must have extensions `*.yaml, *.yml, *.ppd`. All data in any place in folder [PPD_ROOT and PPD_ROOT_ADDITIONAL](#running-arguments)

# Running Arguments
Parameter | Description | Default Value | Type
------------- | ------------- | ------------- | -------------
PPD_ROOT | Root folder of tests | `process.cwd()` | `String`
PPD_ROOT_ADDITIONAL | Append folders of tests and stuff | `[]` | `String[]`
PPD_ROOT_IGNORE | Ignore folders of tests starts with | `['.git', 'node_modules', '.history']` | `String[]`
PPD_TESTS | Name of tests to run one by one | `[]` | `String[]`
PPD_DATA | Object with data | `{}` | `Object`
PPD_SELECTORS | Object with selectors | `{}` | `Object`
PPD_OUTPUT | Path to log folder | `output` | `String`
PPD_DEBUG_MODE | Debug mode | `false` | `Boolean`
PPD_LOG_DISABLED | Disable logging | `false` | `Boolean`
PPD_LOG_EXTEND | Log every atoms time for tuning and breadcrumbs for test | `false` | `Boolean`
PPD_LOG_LEVEL_NESTED | Log only nested levels of log bellow this. `0` - log all | `0` | `Number`
PPD_LOG_LEVEL_TYPE_IGNORE | Log ignore types. [`raw`, `debug`, `info`, `test`, `warn`, `error`, `env`] | `[]` | `String[]`
PPD_LOG_SCREENSHOT | Screenshot of elements enable | `false` | `Boolean`
PPD_LOG_FULLPAGE | Full screen screenshot enable | `false` | `Boolean`
PPD_LOG_AGENT_NAME | Show in log name of test on every line | `true` | `Boolean`
PPD_LOG_IGNORE_HIDE_LOG | Show all log even if it ignore inline | `false` | `Boolean`
PPD_LOG_DOCUMENTATION_MODE | Show documentation in descriptionExtend | `false` | `Boolean`
PPD_LOG_NAMES_ONLY | Show only names in list/ All by default | `[]` | `String[]`
PPD_LOG_TIMER_SHOW | Show timer in log | `false` | `Boolean`
PPD_LOG_TIMESTAMP_SHOW | Show timer in log | `false` | `Boolean`
PPD_LOG_INDENT_LENGTH | Indents in log | `4` | `Number`
PPD_CONTINUE_ON_ERROR_ENABLED | continueOnError flag | `false` | `Boolean`

Arguments applying order. From minor to major:
1. Defaults
1. CLI arguments
1. ENV variables
1. Arguments from script


# Test block settings

## argsRedefine
Переопределение агрументов ENV для конкретного кейса.

Все аргументы описаны в ArgumentsType

```yaml
name: argsRedefine
description: argsRedefine
argsRedefine:
  PPD_LOG_EXTEND: false

runTest:
  - blank:
      description: Because PPD_LOG_EXTEND true globaly - show timer ✔️
      runTest:
        - blank:
            description: Because PPD_LOG_EXTEND true globaly - show timer ✔️

  - blank:
      description: Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌
      argsRedefine:
        PPD_LOG_TIMER_SHOW: false
      runTest:
        - blank:
            description: Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌
            argsRedefine:
              PPD_LOG_TIMER_SHOW: false
  - blank:
      description: Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌
      argsRedefine:
        PPD_LOG_TIMER_SHOW: false
      runTest:
        - blank:
            description: Redefine PPD_LOG_TIMER_SHOW to true - show timer ✔️
            argsRedefine:
              PPD_LOG_TIMER_SHOW: true

  - blank:
      description: Redefine PPD_LOG_TIMER_SHOW to false for parent and child - hide timer ❌
      argsRedefine:
        PPD_LOG_TIMER_SHOW: false
      runTest:
        - blank:
            description: Redefine PPD_LOG_TIMER_SHOW to false with parent - hide timer ❌

```
#### Output:
```
00:00:00.000 - timer  Test 'argsRedefine' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
argsRedefine (argsRedefine)
   Because PPD_LOG_EXTEND true globaly - show timer ✔️ (blank)
      Because PPD_LOG_EXTEND true globaly - show timer ✔️ (blank)
   Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌ (blank)
      Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌ (blank)
   Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌ (blank)
      Redefine PPD_LOG_TIMER_SHOW to true - show timer ✔️ (blank)
   Redefine PPD_LOG_TIMER_SHOW to false for parent and child - hide timer ❌ (blank)
      Redefine PPD_LOG_TIMER_SHOW to false with parent - hide timer ❌ (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (argsRedefine) argsRedefine
00:00:00.000 - test   |   (blank) Because PPD_LOG_EXTEND true globaly - show timer ✔️
00:00:00.000 - test   |   |   (blank) Because PPD_LOG_EXTEND true globaly - show timer ✔️
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌
00:00:00.000 - test   |   |   (blank) Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌
00:00:00.000 - test   |   (blank) Redefine PPD_LOG_TIMER_SHOW to false - hide timer ❌
00:00:00.000 - test   |   |   (blank) Redefine PPD_LOG_TIMER_SHOW to true - show timer ✔️
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Redefine PPD_LOG_TIMER_SHOW to false for parent and child - hide timer ❌
00:00:00.000 - test   |   |   (blank) Redefine PPD_LOG_TIMER_SHOW to false with parent - hide timer ❌
                      🕝: 00.000 s. (argsRedefine)
00:00:00.000 - timer  Test 'argsRedefine' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "argsRedefine": {}
}

```
## logOptions
Управление настройками логирования для отдельных агентов.

```yaml
name: logOptions
description: logOptions test

runTest:
  - blank:
      description: 'Let logOptions.logThis = 🧑 and logOptions.logChildren = 👨‍👦‍👦'

  - blank:
      description: Check logOptions.logThis and logOptions.logChildren
      runTest:
        - blank:
            description: '[1] I am no logOptions block and I am visible'

        - blank:
            description: "[2] I am '🧑 = ✔️' and I am visible"
            logOptions: { logThis: true }

        - blank:
            description: "[3] I am '👨‍👦‍👦 = ✔️' and I am visible"
            logOptions: { logChildren: true }

        - blank:
            description: "[-] I am '🧑 = ❌' and I am NOT🔴 visible"
            logOptions: { logThis: false, backgroundColor: red }

        - blank:
            description: "[4] I am '👨‍👦‍👦 = ❌' and I am visible"
            logOptions: { logChildren: false }

        - blank:
            description: "[5] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible"
            logOptions: { logThis: true, logChildren: true }

        - blank:
            description: "[-] I am '🧑 = ❌ + 👨‍👦‍👦 = ❌' and I am NOT🔴 visible"
            logOptions: { logThis: false, logChildren: false, backgroundColor: red }

        - blank:
            description: "[6] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible"
            logOptions: { logThis: true, logChildren: false }

        - blank:
            description: "[-] I am '🧑 = ❌ + 👨‍👦‍👦 = ✔️' and I am NOT🔴 visible"
            logOptions: { logThis: false, logChildren: true, backgroundColor: red }

        - blank:
            description: I am no logOptions parent block
            runTest:
              - blank:
                  description: '[1] I am no logOptions block and I am visible'

              - blank:
                  description: "[2] I am '🧑 = ✔️' and I am visible"
                  logOptions: { logThis: true }

              - blank:
                  description: "[3] I am '👨‍👦‍👦 = ✔️' and I am visible"
                  logOptions: { logChildren: true }

              - blank:
                  description: "[-] I am '🧑 = ❌' and I am NOT🔴 visible"
                  logOptions: { logThis: false, backgroundColor: red }

              - blank:
                  description: "[4] I am '👨‍👦‍👦 = ❌' and I am visible"
                  logOptions: { logChildren: false }

              - blank:
                  description: "[5] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible"
                  logOptions: { logThis: true, logChildren: true }

              - blank:
                  description: "[-] I am '🧑 = ❌ + 👨‍👦‍👦 = ❌' and I am NOT🔴 visible"
                  logOptions: { logThis: false, logChildren: false, backgroundColor: red }

              - blank:
                  description: "[6] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible"
                  logOptions: { logThis: true, logChildren: false }

              - blank:
                  description: "[-] I am '🧑 = ❌ + 👨‍👦‍👦 = ✔️' and I am NOT🔴 visible"
                  logOptions: { logThis: false, logChildren: true, backgroundColor: red }

        - blank:
            description: I am '👨‍👦‍👦 = ❌' parent block and I am visible
            logOptions: { logChildren: false }
            runTest:
              - blank:
                  description: '[-] I am no logOptions visible block and I am NOT🔴 visible'
                  logOptions: { backgroundColor: red }

              - blank:
                  description: "[1] I am '🧑 = ✔️' and I am visible"
                  logOptions: { logThis: true }

              - blank:
                  description: "[-] I am '👨‍👦‍👦 = ✔️' and I am NOT🔴 visible"
                  logOptions: { logChildren: true, backgroundColor: red }

              - blank:
                  description: "[-] I am '🧑 = ❌' and I am NOT🔴 visible"
                  logOptions: { logThis: false, backgroundColor: red }

              - blank:
                  description: "[-] I am '👨‍👦‍👦 = ❌' and I am NOT🔴 visible"
                  logOptions: { logChildren: false, backgroundColor: red }

              - blank:
                  description: "[2] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible"
                  logOptions: { logThis: true, logChildren: true }

              - blank:
                  description: "[-] I am '🧑 = ❌ + 👨‍👦‍👦 = ❌' and I am NOT🔴 visible"
                  logOptions: { logThis: false, logChildren: false, backgroundColor: red }

              - blank:
                  description: "[3] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible"
                  logOptions: { logThis: true, logChildren: false }

              - blank:
                  description: "[-] I am '🧑 = ❌ + 👨‍👦‍👦 = ✔️' and I am NOT🔴 visible"
                  logOptions: { logThis: false, logChildren: true, backgroundColor: red }

  - blank:
      description: Check logOptions visible into loop with nested blocks
      runTest:
        - blank:
            description: I am '👨‍👦‍👦 = ❌' parent block and I am visible
            logOptions: { logChildren: false }
            runTest:
              - loop:
                  description: 'I am no logOptions visible block and I am NOT🔴 visible'
                  repeat: 2
                  logOptions: { backgroundColor: red }
                  runTest:
                    - blank:
                        description: "I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible"
                        logOptions: { logThis: true, logChildren: false }
                        runTest:
                          - blank:
                              description: 'I am no logOptions visible block and I am NOT🔴 visible'
                              logOptions: { backgroundColor: red }

        - blank:
            description: I am '👨‍👦‍👦 = ❌' parent block and I am visible
            logOptions: { logChildren: false }
            runTest:
              - loop:
                  description: 'I am no logOptions visible block and I am NOT🔴 visible'
                  repeat: 2
                  logOptions: { backgroundColor: red }
                  runTest:
                    - blank:
                        description: "I am '🧑 = ✔️' and I am visible"
                        logOptions: { logThis: true }
                        runTest:
                          - blank:
                              description: 'I am no logOptions visible block and I am NOT🔴 visible'
                              logOptions: { backgroundColor: red }

  - blank:
      description: "logOptions colors: sane, black, red, green, yellow, blue, magenta, cyan, white"
      runTest:
        - blank:
            description: 'Text: none + Background: none'

        - blank:
            description: 'Text: sane + Background: none'
            logOptions: { textColor: sane }

        - blank:
            description: 'Text: black + Background: none'
            logOptions: { textColor: black }

        - blank:
            description: 'Text: red + Background: none'
            logOptions: { textColor: red }

        - blank:
            description: 'Text: green + Background: none'
            logOptions: { textColor: green }

        - blank:
            description: 'Text: yellow + Background: none'
            logOptions: { textColor: yellow }

        - blank:
            description: 'Text: blue + Background: none'
            logOptions: { textColor: blue }

        - blank:
            description: 'Text: magenta + Background: none'
            logOptions: { textColor: magenta }

        - blank:
            description: 'Text: cyan + Background: none'
            logOptions: { textColor: cyan }

        - blank:
            description: 'Text: white + Background: none'
            logOptions: { textColor: white }

        - blank:
            description: 'Text: none + Background: black'
            logOptions: { backgroundColor: black }

        - blank:
            description: 'Text: sane + Background: black'
            logOptions: { textColor: sane, backgroundColor: black }

        - blank:
            description: 'Text: black + Background: black'
            logOptions: { textColor: black, backgroundColor: black }

        - blank:
            description: 'Text: red + Background: black'
            logOptions: { textColor: red, backgroundColor: black }

        - blank:
            description: 'Text: green + Background: black'
            logOptions: { textColor: green, backgroundColor: black }

        - blank:
            description: 'Text: yellow + Background: black'
            logOptions: { textColor: yellow, backgroundColor: black }

        - blank:
            description: 'Text: blue + Background: black'
            logOptions: { textColor: blue, backgroundColor: black }

        - blank:
            description: 'Text: magenta + Background: black'
            logOptions: { textColor: magenta, backgroundColor: black }

        - blank:
            description: 'Text: cyan + Background: black'
            logOptions: { textColor: cyan, backgroundColor: black }

        - blank:
            description: 'Text: white + Background: black'
            logOptions: { textColor: white, backgroundColor: black }

        - blank:
            description: 'Text: none + Background: red'
            logOptions: { backgroundColor: red }

        - blank:
            description: 'Text: sane + Background: red'
            logOptions: { textColor: sane, backgroundColor: red }

        - blank:
            description: 'Text: black + Background: red'
            logOptions: { textColor: black, backgroundColor: red }

        - blank:
            description: 'Text: red + Background: red'
            logOptions: { textColor: red, backgroundColor: red }

        - blank:
            description: 'Text: green + Background: red'
            logOptions: { textColor: green, backgroundColor: red }

        - blank:
            description: 'Text: yellow + Background: red'
            logOptions: { textColor: yellow, backgroundColor: red }

        - blank:
            description: 'Text: blue + Background: red'
            logOptions: { textColor: blue, backgroundColor: red }

        - blank:
            description: 'Text: magenta + Background: red'
            logOptions: { textColor: magenta, backgroundColor: red }

        - blank:
            description: 'Text: cyan + Background: red'
            logOptions: { textColor: cyan, backgroundColor: red }

        - blank:
            description: 'Text: white + Background: red'
            logOptions: { textColor: white, backgroundColor: red }

        - blank:
            description: 'Text: none + Background: green'
            logOptions: { backgroundColor: green }

        - blank:
            description: 'Text: sane + Background: green'
            logOptions: { textColor: sane, backgroundColor: green }

        - blank:
            description: 'Text: black + Background: green'
            logOptions: { textColor: black, backgroundColor: green }

        - blank:
            description: 'Text: red + Background: green'
            logOptions: { textColor: red, backgroundColor: green }

        - blank:
            description: 'Text: green + Background: green'
            logOptions: { textColor: green, backgroundColor: green }

        - blank:
            description: 'Text: yellow + Background: green'
            logOptions: { textColor: yellow, backgroundColor: green }

        - blank:
            description: 'Text: blue + Background: green'
            logOptions: { textColor: blue, backgroundColor: green }

        - blank:
            description: 'Text: magenta + Background: green'
            logOptions: { textColor: magenta, backgroundColor: green }

        - blank:
            description: 'Text: cyan + Background: green'
            logOptions: { textColor: cyan, backgroundColor: green }

        - blank:
            description: 'Text: white + Background: green'
            logOptions: { textColor: white, backgroundColor: green }

        - blank:
            description: 'Text: none + Background: yellow'
            logOptions: { backgroundColor: yellow }

        - blank:
            description: 'Text: sane + Background: yellow'
            logOptions: { textColor: sane, backgroundColor: yellow }

        - blank:
            description: 'Text: black + Background: yellow'
            logOptions: { textColor: black, backgroundColor: yellow }

        - blank:
            description: 'Text: red + Background: yellow'
            logOptions: { textColor: red, backgroundColor: yellow }

        - blank:
            description: 'Text: green + Background: yellow'
            logOptions: { textColor: green, backgroundColor: yellow }

        - blank:
            description: 'Text: yellow + Background: yellow'
            logOptions: { textColor: yellow, backgroundColor: yellow }

        - blank:
            description: 'Text: blue + Background: yellow'
            logOptions: { textColor: blue, backgroundColor: yellow }

        - blank:
            description: 'Text: magenta + Background: yellow'
            logOptions: { textColor: magenta, backgroundColor: yellow }

        - blank:
            description: 'Text: cyan + Background: yellow'
            logOptions: { textColor: cyan, backgroundColor: yellow }

        - blank:
            description: 'Text: white + Background: yellow'
            logOptions: { textColor: white, backgroundColor: yellow }

        - blank:
            description: 'Text: none + Background: blue'
            logOptions: { backgroundColor: blue }

        - blank:
            description: 'Text: sane + Background: blue'
            logOptions: { textColor: sane, backgroundColor: blue }

        - blank:
            description: 'Text: black + Background: blue'
            logOptions: { textColor: black, backgroundColor: blue }

        - blank:
            description: 'Text: red + Background: blue'
            logOptions: { textColor: red, backgroundColor: blue }

        - blank:
            description: 'Text: green + Background: blue'
            logOptions: { textColor: green, backgroundColor: blue }

        - blank:
            description: 'Text: yellow + Background: blue'
            logOptions: { textColor: yellow, backgroundColor: blue }

        - blank:
            description: 'Text: blue + Background: blue'
            logOptions: { textColor: blue, backgroundColor: blue }

        - blank:
            description: 'Text: magenta + Background: blue'
            logOptions: { textColor: magenta, backgroundColor: blue }

        - blank:
            description: 'Text: cyan + Background: blue'
            logOptions: { textColor: cyan, backgroundColor: blue }

        - blank:
            description: 'Text: white + Background: blue'
            logOptions: { textColor: white, backgroundColor: blue }

        - blank:
            description: 'Text: none + Background: magenta'
            logOptions: { backgroundColor: magenta }

        - blank:
            description: 'Text: sane + Background: magenta'
            logOptions: { textColor: sane, backgroundColor: magenta }

        - blank:
            description: 'Text: black + Background: magenta'
            logOptions: { textColor: black, backgroundColor: magenta }

        - blank:
            description: 'Text: red + Background: magenta'
            logOptions: { textColor: red, backgroundColor: magenta }

        - blank:
            description: 'Text: green + Background: magenta'
            logOptions: { textColor: green, backgroundColor: magenta }

        - blank:
            description: 'Text: yellow + Background: magenta'
            logOptions: { textColor: yellow, backgroundColor: magenta }

        - blank:
            description: 'Text: blue + Background: magenta'
            logOptions: { textColor: blue, backgroundColor: magenta }

        - blank:
            description: 'Text: magenta + Background: magenta'
            logOptions: { textColor: magenta, backgroundColor: magenta }

        - blank:
            description: 'Text: cyan + Background: magenta'
            logOptions: { textColor: cyan, backgroundColor: magenta }

        - blank:
            description: 'Text: white + Background: magenta'
            logOptions: { textColor: white, backgroundColor: magenta }

        - blank:
            description: 'Text: none + Background: white'
            logOptions: { backgroundColor: white }

        - blank:
            description: 'Text: sane + Background: white'
            logOptions: { textColor: sane, backgroundColor: white }

        - blank:
            description: 'Text: black + Background: white'
            logOptions: { textColor: black, backgroundColor: white }

        - blank:
            description: 'Text: red + Background: white'
            logOptions: { textColor: red, backgroundColor: white }

        - blank:
            description: 'Text: green + Background: white'
            logOptions: { textColor: green, backgroundColor: white }

        - blank:
            description: 'Text: yellow + Background: white'
            logOptions: { textColor: yellow, backgroundColor: white }

        - blank:
            description: 'Text: blue + Background: white'
            logOptions: { textColor: blue, backgroundColor: white }

        - blank:
            description: 'Text: magenta + Background: white'
            logOptions: { textColor: magenta, backgroundColor: white }

        - blank:
            description: 'Text: cyan + Background: white'
            logOptions: { textColor: cyan, backgroundColor: white }

        - blank:
            description: 'Text: white + Background: white'
            logOptions: { textColor: white, backgroundColor: white }

        - blank:
            description: 'Text: none + Background: cyan'
            logOptions: { backgroundColor: cyan }

        - blank:
            description: 'Text: sane + Background: cyan'
            logOptions: { textColor: sane, backgroundColor: cyan }

        - blank:
            description: 'Text: black + Background: cyan'
            logOptions: { textColor: black, backgroundColor: cyan }

        - blank:
            description: 'Text: red + Background: cyan'
            logOptions: { textColor: red, backgroundColor: cyan }

        - blank:
            description: 'Text: green + Background: cyan'
            logOptions: { textColor: green, backgroundColor: cyan }

        - blank:
            description: 'Text: yellow + Background: cyan'
            logOptions: { textColor: yellow, backgroundColor: cyan }

        - blank:
            description: 'Text: blue + Background: cyan'
            logOptions: { textColor: blue, backgroundColor: cyan }

        - blank:
            description: 'Text: magenta + Background: cyan'
            logOptions: { textColor: magenta, backgroundColor: cyan }

        - blank:
            description: 'Text: cyan + Background: cyan'
            logOptions: { textColor: cyan, backgroundColor: cyan }

        - blank:
            description: 'Text: white + Background: cyan'
            logOptions: { textColor: white, backgroundColor: cyan }

        - blank:
            description: You can add to backgroundColor 'Background' word like 'whiteBackground'
            runTest:
              - blank:
                  description: 'Background: blackBackground'
                  logOptions: { textColor: sane, backgroundColor: blackBackground }

              - blank:
                  description: 'Background: redBackground'
                  logOptions: { textColor: black, backgroundColor: redBackground }

              - blank:
                  description: 'Background: greenBackground'
                  logOptions: { textColor: black, backgroundColor: greenBackground }

              - blank:
                  description: 'Background: yellowBackground'
                  logOptions: { textColor: black, backgroundColor: yellowBackground }

              - blank:
                  description: 'Background: blueBackground'
                  logOptions: { textColor: black, backgroundColor: blueBackground }

              - blank:
                  description: 'Background: magentaBackground'
                  logOptions: { textColor: black, backgroundColor: magentaBackground }

              - blank:
                  description: 'Background: cyanBackground'
                  logOptions: { textColor: black, backgroundColor: cyanBackground }

              - blank:
                  description: 'Background: whiteBackground'
                  logOptions: { textColor: black, backgroundColor: whiteBackground }


  - blank:
      description: Redefine colors in nested blocks
      runTest:
        - blank:
            description: 'Text: white + Background: green'
            logOptions: { textColor: white, backgroundColor: green }
            runTest:
              - blank:
                  description: 'I am not colored'

              - loop:
                  description: 'Text: red + Background: white'
                  repeat: 2
                  logOptions: { textColor: red, backgroundColor: white }
                  runTest:
                    - blank:
                        description: 'I am not colored'
                        runTest:
                          - blank:
                              description: 'Text: yellow + Background: magenta'
                              logOptions: { textColor: yellow, backgroundColor: magenta }
```
#### Output:
```
00:00:00.000 - timer  Test 'logOptions' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
logOptions test (logOptions)
   Let logOptions.logThis = 🧑 and logOptions.logChildren = 👨‍👦‍👦 (blank)
   Check logOptions.logThis and logOptions.logChildren (blank)
      [1] I am no logOptions block and I am visible (blank)
      [2] I am '🧑 = ✔️' and I am visible (blank)
      [3] I am '👨‍👦‍👦 = ✔️' and I am visible (blank)
      [-] I am '🧑 = ❌' and I am NOT🔴 visible (blank)
      [4] I am '👨‍👦‍👦 = ❌' and I am visible (blank)
      [5] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible (blank)
      [-] I am '🧑 = ❌ + 👨‍👦‍👦 = ❌' and I am NOT🔴 visible (blank)
      [6] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible (blank)
      [-] I am '🧑 = ❌ + 👨‍👦‍👦 = ✔️' and I am NOT🔴 visible (blank)
      I am no logOptions parent block (blank)
         [1] I am no logOptions block and I am visible (blank)
         [2] I am '🧑 = ✔️' and I am visible (blank)
         [3] I am '👨‍👦‍👦 = ✔️' and I am visible (blank)
         [-] I am '🧑 = ❌' and I am NOT🔴 visible (blank)
         [4] I am '👨‍👦‍👦 = ❌' and I am visible (blank)
         [5] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible (blank)
         [-] I am '🧑 = ❌ + 👨‍👦‍👦 = ❌' and I am NOT🔴 visible (blank)
         [6] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible (blank)
         [-] I am '🧑 = ❌ + 👨‍👦‍👦 = ✔️' and I am NOT🔴 visible (blank)
      I am '👨‍👦‍👦 = ❌' parent block and I am visible (blank)
         [-] I am no logOptions visible block and I am NOT🔴 visible (blank)
         [1] I am '🧑 = ✔️' and I am visible (blank)
         [-] I am '👨‍👦‍👦 = ✔️' and I am NOT🔴 visible (blank)
         [-] I am '🧑 = ❌' and I am NOT🔴 visible (blank)
         [-] I am '👨‍👦‍👦 = ❌' and I am NOT🔴 visible (blank)
         [2] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible (blank)
         [-] I am '🧑 = ❌ + 👨‍👦‍👦 = ❌' and I am NOT🔴 visible (blank)
         [3] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible (blank)
         [-] I am '🧑 = ❌ + 👨‍👦‍👦 = ✔️' and I am NOT🔴 visible (blank)
   Check logOptions visible into loop with nested blocks (blank)
      I am '👨‍👦‍👦 = ❌' parent block and I am visible (blank)
         I am no logOptions visible block and I am NOT🔴 visible (loop)
            I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible (blank)
               I am no logOptions visible block and I am NOT🔴 visible (blank)
      I am '👨‍👦‍👦 = ❌' parent block and I am visible (blank)
         I am no logOptions visible block and I am NOT🔴 visible (loop)
            I am '🧑 = ✔️' and I am visible (blank)
               I am no logOptions visible block and I am NOT🔴 visible (blank)
   logOptions colors: sane, black, red, green, yellow, blue, magenta, cyan, white (blank)
      Text: none + Background: none (blank)
      Text: sane + Background: none (blank)
      Text: black + Background: none (blank)
      Text: red + Background: none (blank)
      Text: green + Background: none (blank)
      Text: yellow + Background: none (blank)
      Text: blue + Background: none (blank)
      Text: magenta + Background: none (blank)
      Text: cyan + Background: none (blank)
      Text: white + Background: none (blank)
      Text: none + Background: black (blank)
      Text: sane + Background: black (blank)
      Text: black + Background: black (blank)
      Text: red + Background: black (blank)
      Text: green + Background: black (blank)
      Text: yellow + Background: black (blank)
      Text: blue + Background: black (blank)
      Text: magenta + Background: black (blank)
      Text: cyan + Background: black (blank)
      Text: white + Background: black (blank)
      Text: none + Background: red (blank)
      Text: sane + Background: red (blank)
      Text: black + Background: red (blank)
      Text: red + Background: red (blank)
      Text: green + Background: red (blank)
      Text: yellow + Background: red (blank)
      Text: blue + Background: red (blank)
      Text: magenta + Background: red (blank)
      Text: cyan + Background: red (blank)
      Text: white + Background: red (blank)
      Text: none + Background: green (blank)
      Text: sane + Background: green (blank)
      Text: black + Background: green (blank)
      Text: red + Background: green (blank)
      Text: green + Background: green (blank)
      Text: yellow + Background: green (blank)
      Text: blue + Background: green (blank)
      Text: magenta + Background: green (blank)
      Text: cyan + Background: green (blank)
      Text: white + Background: green (blank)
      Text: none + Background: yellow (blank)
      Text: sane + Background: yellow (blank)
      Text: black + Background: yellow (blank)
      Text: red + Background: yellow (blank)
      Text: green + Background: yellow (blank)
      Text: yellow + Background: yellow (blank)
      Text: blue + Background: yellow (blank)
      Text: magenta + Background: yellow (blank)
      Text: cyan + Background: yellow (blank)
      Text: white + Background: yellow (blank)
      Text: none + Background: blue (blank)
      Text: sane + Background: blue (blank)
      Text: black + Background: blue (blank)
      Text: red + Background: blue (blank)
      Text: green + Background: blue (blank)
      Text: yellow + Background: blue (blank)
      Text: blue + Background: blue (blank)
      Text: magenta + Background: blue (blank)
      Text: cyan + Background: blue (blank)
      Text: white + Background: blue (blank)
      Text: none + Background: magenta (blank)
      Text: sane + Background: magenta (blank)
      Text: black + Background: magenta (blank)
      Text: red + Background: magenta (blank)
      Text: green + Background: magenta (blank)
      Text: yellow + Background: magenta (blank)
      Text: blue + Background: magenta (blank)
      Text: magenta + Background: magenta (blank)
      Text: cyan + Background: magenta (blank)
      Text: white + Background: magenta (blank)
      Text: none + Background: white (blank)
      Text: sane + Background: white (blank)
      Text: black + Background: white (blank)
      Text: red + Background: white (blank)
      Text: green + Background: white (blank)
      Text: yellow + Background: white (blank)
      Text: blue + Background: white (blank)
      Text: magenta + Background: white (blank)
      Text: cyan + Background: white (blank)
      Text: white + Background: white (blank)
      Text: none + Background: cyan (blank)
      Text: sane + Background: cyan (blank)
      Text: black + Background: cyan (blank)
      Text: red + Background: cyan (blank)
      Text: green + Background: cyan (blank)
      Text: yellow + Background: cyan (blank)
      Text: blue + Background: cyan (blank)
      Text: magenta + Background: cyan (blank)
      Text: cyan + Background: cyan (blank)
      Text: white + Background: cyan (blank)
      You can add to backgroundColor 'Background' word like 'whiteBackground' (blank)
         Background: blackBackground (blank)
         Background: redBackground (blank)
         Background: greenBackground (blank)
         Background: yellowBackground (blank)
         Background: blueBackground (blank)
         Background: magentaBackground (blank)
         Background: cyanBackground (blank)
         Background: whiteBackground (blank)
   Redefine colors in nested blocks (blank)
      Text: white + Background: green (blank)
         I am not colored (blank)
         Text: red + Background: white (loop)
            I am not colored (blank)
               Text: yellow + Background: magenta (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (logOptions) logOptions test
00:00:00.000 - test   |   (blank) Let logOptions.logThis = 🧑 and logOptions.logChildren = 👨‍👦‍👦
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Check logOptions.logThis and logOptions.logChildren
00:00:00.000 - test   |   |   (blank) [1] I am no logOptions block and I am visible
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) [2] I am '🧑 = ✔️' and I am visible
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) [3] I am '👨‍👦‍👦 = ✔️' and I am visible
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) [4] I am '👨‍👦‍👦 = ❌' and I am visible
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) [5] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) [6] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I am no logOptions parent block
00:00:00.000 - test   |   |   |   (blank) [1] I am no logOptions block and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) [2] I am '🧑 = ✔️' and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) [3] I am '👨‍👦‍👦 = ✔️' and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) [4] I am '👨‍👦‍👦 = ❌' and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) [5] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) [6] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I am '👨‍👦‍👦 = ❌' parent block and I am visible
00:00:00.000 - test   |   |   |   (blank) [1] I am '🧑 = ✔️' and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) [2] I am '🧑 = ✔️ + 👨‍👦‍👦 = ✔️' and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) [3] I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible
                      |   |   |   🕝: 00.000 s. (blank)
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Check logOptions visible into loop with nested blocks
00:00:00.000 - test   |   |   (blank) I am '👨‍👦‍👦 = ❌' parent block and I am visible
00:00:00.000 - test   |   |   |   |   (blank) I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible
                      |   |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   |   (blank) I am '🧑 = ✔️ + 👨‍👦‍👦 = ❌' and I am visible
                      |   |   |   |   🕝: 00.000 s. (blank)
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I am '👨‍👦‍👦 = ❌' parent block and I am visible
00:00:00.000 - test   |   |   |   |   (blank) I am '🧑 = ✔️' and I am visible
                      |   |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   |   (blank) I am '🧑 = ✔️' and I am visible
                      |   |   |   |   🕝: 00.000 s. (blank)
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) logOptions colors: sane, black, red, green, yellow, blue, magenta, cyan, white
00:00:00.000 - test   |   |   (blank) Text: none + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: none
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: none + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: black
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: none + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: red
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: none + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: green
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: none + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: yellow
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: none + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: blue
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: none + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: magenta
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: none + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: white
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: none + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: sane + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: black + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: red + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: green + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: yellow + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: blue + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: magenta + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: cyan + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Text: white + Background: cyan
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) You can add to backgroundColor 'Background' word like 'whiteBackground'
00:00:00.000 - test   |   |   |   (blank) Background: blackBackground
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) Background: redBackground
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) Background: greenBackground
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) Background: yellowBackground
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) Background: blueBackground
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) Background: magentaBackground
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) Background: cyanBackground
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (blank) Background: whiteBackground
                      |   |   |   🕝: 00.000 s. (blank)
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Redefine colors in nested blocks
00:00:00.000 - test   |   |   (blank) Text: white + Background: green
00:00:00.000 - test   |   |   |   (blank) I am not colored
                      |   |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   |   (loop) Text: red + Background: white
00:00:00.000 - test   |   |   |   |   (blank) I am not colored
00:00:00.000 - test   |   |   |   |   |   (blank) Text: yellow + Background: magenta
                      |   |   |   |   |   🕝: 00.000 s. (blank)
                      |   |   |   |   🕝: 00.000 s. (blank)
                      |   |   |   🕝: 00.000 s. (loop)
00:00:00.000 - test   |   |   |   (loop) Text: red + Background: white
00:00:00.000 - test   |   |   |   |   (blank) I am not colored
00:00:00.000 - test   |   |   |   |   |   (blank) Text: yellow + Background: magenta
                      |   |   |   |   |   🕝: 00.000 s. (blank)
                      |   |   |   |   🕝: 00.000 s. (blank)
                      |   |   |   🕝: 00.000 s. (loop)
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
                      🕝: 00.000 s. (logOptions)
00:00:00.000 - timer  Test 'logOptions' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "logOptions": {}
}

```
## options
Плагин для управления опциями агентов.

Опции наследуются от родительского агента к дочерним.

Дочерние агенты могут переопределять унаследованные опции.

Позволяет агентам указывать, какие опции разрешены для использования.

Опции, указанные в allowOptions, могут быть использованы в дочерних агентах.

```yaml
name: options
description: Options inheritance test
```
#### Output:
```
00:00:00.000 - timer  Test 'options' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
Options inheritance test (options)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (options) Options inheritance test
                      🕝: 00.000 s. (options)
00:00:00.000 - timer  Test 'options' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "options": {}
}

```
## descriptionError
При падении тестов в логи выводится информация из этого поля

Поле является исполняемым в контексте данных

```yaml
name: descriptionError
description: descriptionError
runTest:
  - blank:
      description: "Simple descriptionError"
      errorIf: true
      descriptionError: "Simple descriptionError"

```
#### Output:
```
00:00:00.000 - timer  Test 'descriptionError' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
descriptionError (descriptionError)
   Simple descriptionError (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (descriptionError) descriptionError
00:00:00.000 - error  |   Test stopped with expr errorIf = 'true'
00:00:00.000 - error  |    descriptionError
00:00:00.000 - error  |       runTest[0].blank
00:00:00.000 - error  |    =============================================================================================
00:00:00.000 - error  |   Simple descriptionError | Description: Simple descriptionError (blank)
00:00:00.000 - error  |    descriptionError
00:00:00.000 - error  |       runTest[0].blank
00:00:00.000 - error  |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |    =============================================================================================
00:00:00.000 - error   Description: descriptionError (descriptionError)
00:00:00.000 - error   descriptionError
00:00:00.000 - error   (file:///Plugins\descriptionError\descriptionError.yaml)
00:00:00.000 - error   ================================================================================================
                      Test stopped with expr errorIf = 'true'
                      error in test = blank
                      error in test = descriptionError
                      ================================================================================================
                      Error: Test stopped with expr errorIf = 'true'
                      at checkIf (\@puppedo\core\src\Test)
                      at processTicksAndRejections (node:internal/process/task_queues)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at runAgent (\@puppedo\core\src\Api)
                      at Object.run (\@puppedo\core\src\Api)
                      at runTest (\runAllTests)
                      at start (\runAllTests)
00:00:00.000 - error  █ SUMMARY ERROR INFO:
                      █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                      █ Message:     Test stopped with expr errorIf = 'true'
                      █ Error:       Simple descriptionError
                      █ Path:        descriptionError -> runTest[0].blank
                      █ Description:
                      █    descriptionError

```
```yaml
name: descriptionErrorNested
description: descriptionErrorNested
runTest:
  - blank:
      description: "description 0"
      descriptionError: "descriptionError 0"
      runTest:
        - blank:
            description: "description 1"
            errorIf: true
            descriptionError: "descriptionError 1"
```
#### Output:
```
00:00:00.000 - timer  Test 'descriptionErrorNested' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
descriptionErrorNested (descriptionErrorNested)
   description 0 (blank)
      description 1 (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (descriptionErrorNested) descriptionErrorNested
00:00:00.000 - test   |   (blank) description 0
00:00:00.000 - error  |   |   Test stopped with expr errorIf = 'true'
00:00:00.000 - error  |   |    descriptionErrorNested
00:00:00.000 - error  |   |       runTest[0].blank
00:00:00.000 - error  |   |          runTest[0].blank
00:00:00.000 - error  |   |    ==========================================================================================
00:00:00.000 - error  |   |   descriptionError 1 | Description: description 1 (blank)
00:00:00.000 - error  |   |    descriptionErrorNested
00:00:00.000 - error  |   |       runTest[0].blank
00:00:00.000 - error  |   |          runTest[0].blank
00:00:00.000 - error  |   |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |   |    ==========================================================================================
00:00:00.000 - error  |   descriptionError 0 | Description: description 0 (blank)
00:00:00.000 - error  |    descriptionErrorNested
00:00:00.000 - error  |       runTest[0].blank
00:00:00.000 - error  |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |    =============================================================================================
00:00:00.000 - error   Description: descriptionErrorNested (descriptionErrorNested)
00:00:00.000 - error   descriptionErrorNested
00:00:00.000 - error   (file:///Plugins\descriptionError\descriptionErrorNested.yaml)
00:00:00.000 - error   ================================================================================================
                      Test stopped with expr errorIf = 'true'
                      error in test = blank
                      error in test = blank
                      error in test = descriptionErrorNested
                      ================================================================================================
                      Error: Test stopped with expr errorIf = 'true'
                      at checkIf (\@puppedo\core\src\Test)
                      at processTicksAndRejections (node:internal/process/task_queues)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at runAgent (\@puppedo\core\src\Api)
                      at Object.run (\@puppedo\core\src\Api)
00:00:00.000 - error  █ SUMMARY ERROR INFO:
                      █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                      █ Message:     Test stopped with expr errorIf = 'true'
                      █ Error:       descriptionError 1 | descriptionError 0
                      █ Path:        descriptionErrorNested -> runTest[0].blank -> runTest[0].blank
                      █ Description:
                      █    descriptionErrorNested
                      █       description 0

```
```yaml
name: descriptionErrorDynamic
description: descriptionErrorDynamic
allowResults: ["apples"]
data: { apples: 5 }
runTest:
  - blank:
      bindDescription: "`I get ${apples} apples`"
      descriptionError: "`Now I get only ${apples} apples`"
      result: { apples: 1 }
      errorIfResult: apples < 5

```
#### Output:
```
00:00:00.000 - timer  Test 'descriptionErrorDynamic' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
descriptionErrorDynamic (descriptionErrorDynamic)
   (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (descriptionErrorDynamic) descriptionErrorDynamic
00:00:00.000 - test   |   (blank) I get 5 apples
00:00:00.000 - error  |   |   Test stopped with expr errorIfResult = 'apples < 5'
00:00:00.000 - error  |   |    descriptionErrorDynamic
00:00:00.000 - error  |   |       runTest[0].blank
00:00:00.000 - error  |   |    ==========================================================================================
00:00:00.000 - error  |   Now I get only 1 apples | Description: No test description (blank)
00:00:00.000 - error  |    descriptionErrorDynamic
00:00:00.000 - error  |       runTest[0].blank
00:00:00.000 - error  |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |    =============================================================================================
00:00:00.000 - error   Description: descriptionErrorDynamic (descriptionErrorDynamic)
00:00:00.000 - error   descriptionErrorDynamic
00:00:00.000 - error   (file:///Plugins\descriptionError\descriptionErrorDynamic.yaml)
00:00:00.000 - error   ================================================================================================
                      Test stopped with expr errorIfResult = 'apples < 5'
                      error in test = blank
                      error in test = descriptionErrorDynamic
                      ================================================================================================
                      Error: Test stopped with expr errorIfResult = 'apples < 5'
                      at checkIf (\@puppedo\core\src\Test)
                      at processTicksAndRejections (node:internal/process/task_queues)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at runAgent (\@puppedo\core\src\Api)
                      at Object.run (\@puppedo\core\src\Api)
                      at runTest (\runAllTests)
                      at start (\runAllTests)
00:00:00.000 - error  █ SUMMARY ERROR INFO:
                      █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                      █ Message:     Test stopped with expr errorIfResult = 'apples < 5'
                      █ Error:       Now I get only 1 apples
                      █ Path:        descriptionErrorDynamic -> runTest[0].blank
                      █ Description:
                      █    descriptionErrorDynamic

```
## continueOnError
Булевое значение. Отвечает за поведение блока при ошибке.

Управление происходит с помощью глобальной переменной [PPD_CONTINUE_ON_ERROR_ENABLED](#PPD_CONTINUE_ON_ERROR_ENABLED) уоторая включает и выключает данную функцию.

При [PPD_CONTINUE_ON_ERROR_ENABLED](#PPD_CONTINUE_ON_ERROR_ENABLED) === false "continueOnError" игнорируется.

Если continueOnError === true, то при ошибке в блоке он пропустится и пойдет следующий

Если continueOnError === false, то при ошибке в блоке он выдаст ошибку

```yaml
name: continueOnError
description: continueOnError
argsRedefine: { PPD_CONTINUE_ON_ERROR_ENABLED: true }
run:
  - blank:
      description: Skip me if I broken
      continueOnError: true
      run:
        - blank:
            errorIfResult: 1 === 1
            descriptionError: This is error description

  - blank:
      repeat: 3
      continueOnError: true
      run:
        - blank:
            bindDescription: "`Second level loop: ${$loop}`"
            errorIfResult: "$loop < 2"

        - blank:
            description: "I`m next"

  - blank:
      description: I am without errors

  - blank:
      description: Continue even if my child is broken
      continueOnError: true
      run:
        - blank:
            argsRedefine:
              PPD_CONTINUE_ON_ERROR_ENABLED: false
            errorIfResult: 1 === 1
            descriptionError: This is error because PPD_CONTINUE_ON_ERROR_ENABLED is False

  - blank:
      description: Error me if I broken
      run:
        - blank:
            argsRedefine:
              PPD_CONTINUE_ON_ERROR_ENABLED: false
            errorIfResult: 2 === 2
            descriptionError: This is error because PPD_CONTINUE_ON_ERROR_ENABLED is False

```
#### Output:
```
00:00:00.000 - timer  Test 'continueOnError' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
continueOnError (continueOnError)
   Skip me if I broken (blank)
      (blank)
   (blank)
      (blank)
      I`m next (blank)
   I am without errors (blank)
   Continue even if my child is broken (blank)
      (blank)
   Error me if I broken (blank)
      (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (continueOnError) continueOnError
00:00:00.000 - test   |   (blank) Skip me if I broken
00:00:00.000 - test   |   |   (blank) TODO: Fill description
00:00:00.000 - error  |   |   |   Test stopped with expr errorIfResult = '1 === 1'
00:00:00.000 - error  |   |   |    continueOnError
00:00:00.000 - error  |   |   |       run[0].blank
00:00:00.000 - error  |   |   |          run[0].blank
00:00:00.000 - error  |   |   |    =======================================================================================
00:00:00.000 - error  |   |   This is error description | Description: No test description (blank)
00:00:00.000 - error  |   |    continueOnError
00:00:00.000 - error  |   |       run[0].blank
00:00:00.000 - error  |   |          run[0].blank
00:00:00.000 - error  |   |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |   |    ==========================================================================================
00:00:00.000 - warn   |   Continue: Test stopped with expr errorIfResult = '1 === 1' || error in test = blank
00:00:00.000 - test   |   (blank) TODO: Fill description
00:00:00.000 - test   |   |   (blank) Second level loop: 3
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) TODO: Fill description
00:00:00.000 - test   |   |   (blank) Second level loop: 2
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) TODO: Fill description
00:00:00.000 - test   |   |   (blank) Second level loop: 1
00:00:00.000 - error  |   |   |   Test stopped with expr errorIfResult = '$loop < 2'
00:00:00.000 - error  |   |   |    continueOnError
00:00:00.000 - error  |   |   |       run[1].blank
00:00:00.000 - error  |   |   |          run[0].blank
00:00:00.000 - error  |   |   |    =======================================================================================
00:00:00.000 - error  |   |    Description: No test description (blank)
00:00:00.000 - error  |   |    continueOnError
00:00:00.000 - error  |   |       run[1].blank
00:00:00.000 - error  |   |          run[0].blank
00:00:00.000 - error  |   |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |   |    ==========================================================================================
00:00:00.000 - warn   |   Continue: Test stopped with expr errorIfResult = '$loop < 2' || error in test = blank
00:00:00.000 - test   |   (blank) I am without errors
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Continue even if my child is broken
00:00:00.000 - test   |   |   (blank) TODO: Fill description
00:00:00.000 - error  |   |   |   Test stopped with expr errorIfResult = '1 === 1'
00:00:00.000 - error  |   |   |    continueOnError
00:00:00.000 - error  |   |   |       run[3].blank
00:00:00.000 - error  |   |   |          run[0].blank
00:00:00.000 - error  |   |   |    =======================================================================================
00:00:00.000 - error  |   |   This is error because PPD_CONTINUE_ON_ERROR_ENABLED is False | Description: No test description (blank)
00:00:00.000 - error  |   |    continueOnError
00:00:00.000 - error  |   |       run[3].blank
00:00:00.000 - error  |   |          run[0].blank
00:00:00.000 - error  |   |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |   |    ==========================================================================================
00:00:00.000 - warn   |   Continue: Test stopped with expr errorIfResult = '1 === 1' || error in test = blank
00:00:00.000 - test   |   (blank) Error me if I broken
00:00:00.000 - test   |   |   (blank) TODO: Fill description
00:00:00.000 - error  |   |   |   Test stopped with expr errorIfResult = '2 === 2'
00:00:00.000 - error  |   |   |    continueOnError
00:00:00.000 - error  |   |   |       run[4].blank
00:00:00.000 - error  |   |   |          run[0].blank
00:00:00.000 - error  |   |   |    =======================================================================================
00:00:00.000 - error  |   |   This is error because PPD_CONTINUE_ON_ERROR_ENABLED is False | Description: No test description (blank)
00:00:00.000 - error  |   |    continueOnError
00:00:00.000 - error  |   |       run[4].blank
00:00:00.000 - error  |   |          run[0].blank
00:00:00.000 - error  |   |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |   |    ==========================================================================================
00:00:00.000 - error  |    Description: Error me if I broken (blank)
00:00:00.000 - error  |    continueOnError
00:00:00.000 - error  |       run[4].blank
00:00:00.000 - error  |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |    =============================================================================================
00:00:00.000 - error   Description: continueOnError (continueOnError)
00:00:00.000 - error   continueOnError
00:00:00.000 - error   (file:///Plugins\continueOnError\continueOnError.yaml)
00:00:00.000 - error   ================================================================================================
                      Test stopped with expr errorIfResult = '2 === 2'
                      error in test = blank
                      error in test = blank
                      error in test = continueOnError
                      ================================================================================================
                      Error: Test stopped with expr errorIfResult = '2 === 2'
                      at checkIf (\@puppedo\core\src\Test)
                      at processTicksAndRejections (node:internal/process/task_queues)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at Test.runLogic (\@puppedo\core\src\Test)
                      at stepFunction (\@puppedo\core\src\getAgent)
                      at runAgent (\@puppedo\core\src\Api)
                      at Object.run (\@puppedo\core\src\Api)
00:00:00.000 - error  █ SUMMARY ERROR INFO:
                      █▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
                      █ Message:     Test stopped with expr errorIfResult = '2 === 2'
                      █ Error:       This is error description | This is error because PPD_CONTINUE_ON_ERROR_ENABLED is False | This is error because PPD_CONTINUE_ON_ERROR_ENABLED is False
                      █ Path:        continueOnError -> run[4].blank -> run[0].blank
                      █ Description:
                      █    continueOnError
                      █       Error me if I broken

```
## skipSublingIfResult
Валидное JS выражение. Которое переводится в контексте конкретного блока в Boolean.

На основании этого результата принимается решение:

1. Если результат === true, то все последующие блоки на этом уровне пропускаются.

2. Если false, то все последующие блоки игнорируют эту инструкцию.

```yaml
name: skipSublingIfResult
description: "skipSublingIfResult"
runTest:
  - blank:
      description: "Simple skipSublingIfResult"
      runTest:
        - blank:
            description: "✔️ I`m not skiped"

        - blank:
            description: "Skip after me"
            skipSublingIfResult: "1 === 1"

        - blank:
            description: "❌ I`m skiped"

        - blank:
            description: "❌ I`m skiped too"

  - blank:
      description: "Loop with skipSublingIfResult"
      repeat: 3
      runTest:
        - blank:
            description: "I`m first"

        - blank:
            bindDescription: "`Only repeat #2 Skip Subling. Loop: ${$loop}`"
            skipSublingIfResult: "$loop === 2"

        - blank:
            description: "I`m next (skiped in #2 repeate)"

        - blank:
            description: "I`m next too (skiped in #2 repeate)"

  - blank:
      description: "If true with skipSublingIfResult"
      runTest:
        - blank:
            if: "1 === 1"
            description: "Skip after me"
            skipSublingIfResult: "1 === 1"

        - blank:
            description: "❌ I`m skiped"

  - blank:
      description: "If false with skipSublingIfResult"
      runTest:
        - blank:
            if: "1 !== 1"
            description: "Skip after me"
            skipSublingIfResult: "1 === 1"

        - blank:
            description: "✔️ I`m not skiped"

  - blank:
      description: ✔️ I`m not skiped. On higher level.

```
#### Output:
```
00:00:00.000 - timer  Test 'skipSublingIfResult' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
skipSublingIfResult (skipSublingIfResult)
   Simple skipSublingIfResult (blank)
      ✔️ I`m not skiped (blank)
      Skip after me (blank)
      ❌ I`m skiped (blank)
      ❌ I`m skiped too (blank)
   Loop with skipSublingIfResult (blank)
      I`m first (blank)
      (blank)
      I`m next (skiped in #2 repeate) (blank)
      I`m next too (skiped in #2 repeate) (blank)
   If true with skipSublingIfResult (blank)
      Skip after me (blank)
      ❌ I`m skiped (blank)
   If false with skipSublingIfResult (blank)
      Skip after me (blank)
      ✔️ I`m not skiped (blank)
   ✔️ I`m not skiped. On higher level. (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (skipSublingIfResult) skipSublingIfResult
00:00:00.000 - test   |   (blank) Simple skipSublingIfResult
00:00:00.000 - test   |   |   (blank) ✔️ I`m not skiped
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Skip after me
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - raw    |   |   Skip with skipMeBecausePrevSublingResults or skipSublingIfResult: (blank) ❌ I`m skiped
00:00:00.000 - raw    |   |   Skip with skipMeBecausePrevSublingResults or skipSublingIfResult: (blank) ❌ I`m skiped too
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Loop with skipSublingIfResult
00:00:00.000 - test   |   |   (blank) I`m first
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Only repeat #2 Skip Subling. Loop: 3
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next (skiped in #2 repeate)
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next too (skiped in #2 repeate)
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Loop with skipSublingIfResult
00:00:00.000 - test   |   |   (blank) I`m first
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Only repeat #2 Skip Subling. Loop: 2
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - raw    |   |   Skip with skipMeBecausePrevSublingResults or skipSublingIfResult: (blank) I`m next (skiped in #2 repeate)
00:00:00.000 - raw    |   |   Skip with skipMeBecausePrevSublingResults or skipSublingIfResult: (blank) I`m next too (skiped in #2 repeate)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Loop with skipSublingIfResult
00:00:00.000 - test   |   |   (blank) I`m first
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Only repeat #2 Skip Subling. Loop: 1
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next (skiped in #2 repeate)
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next too (skiped in #2 repeate)
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) If true with skipSublingIfResult
00:00:00.000 - test   |   |   (blank) Skip after me
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - raw    |   |   Skip with skipMeBecausePrevSublingResults or skipSublingIfResult: (blank) ❌ I`m skiped
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) If false with skipSublingIfResult
00:00:00.000 - info   |   |   Skip with IF expr '1 !== 1' === 'false'
00:00:00.000 - test   |   |   (blank) ✔️ I`m not skiped
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) ✔️ I`m not skiped. On higher level.
                      |   🕝: 00.000 s. (blank)
                      🕝: 00.000 s. (skipSublingIfResult)
00:00:00.000 - timer  Test 'skipSublingIfResult' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "skipSublingIfResult": {}
}

```
## engineSupports
Плагин для проверки поддержки браузерных движков, с помощью которых работают агенты

```yaml
name: engineSupports
dataExt:
  - dataExtMain

beforeRun:
  - runnerSwitch:
      data: { runnerName: mainRunner }

run:
  - blank:
      description: Do not use engineSupports

  - blank:
      description: Use variouse engines
      engineSupports: ['puppeteer', 'playwright']

  - blank:
      description: Use one engine
      engineSupports: ['playwright']

---
name: engineSupportsExistsButError
dataExt:
  - dataExtMain

beforeRun:
  - runnerSwitch:
      data: { runnerName: mainRunner }

run:
  - blank:
      description: Error when use not supported engine
      engineSupports: ['puppeteer']

---
name: engineSupportsFakeEngine
dataExt:
  - dataExtMain

beforeRun:
  - runnerSwitch:
      data: { runnerName: mainRunner }

run:
  - blank:
      description: Error when use fake engine
      engineSupports: ['fakeEngine']
```
#### Output:
```
00:00:00.000 - timer  Test 'engineSupports' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
(engineSupports)
   (runnerSwitch)
   Do not use engineSupports (blank)
   Use variouse engines (blank)
   Use one engine (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (engineSupports) TODO: Fill description
00:00:00.000 - test   |   (runnerSwitch) Switch on runner: 'mainRunner'
00:00:00.000 - raw    |   |   Runner switch on 'mainRunner'
                      |   🕝: 00.000 s. (runnerSwitch)
00:00:00.000 - test   |   (blank) Do not use engineSupports
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Use variouse engines
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Use one engine
                      |   🕝: 00.000 s. (blank)
                      🕝: 00.000 s. (engineSupports)
00:00:00.000 - timer  Test 'engineSupports' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "engineSupports": {}
}

```
## frame
Поддержка работы с фреймами. Позволяет указать целевой фрейм для выполнения действий.

```yaml
name: frame
description: Frame support test
dataExt:
  - data
  - selectors

beforeRun:
  - runnerSwitch:
      bindData: { runnerName: mainRunner }

  - goTo:
      bindDescription: "'Going on page ' + url"
      bD: { url: baseUrl }

run:
  - blank:
      description: No frame
      run:
        - getText:
            bindSelector: { selector: mainText }
            r: { result: text }
            errorIfResult: "result !== 'Simple Text'"

  - blank:
      description: Get text from frame
      stepId: 'frame'
      frame: 'namedFrame'
      run:
        - getText:
            stepId: 'get'
            bindSelector: { selector: frameText }
            result: { result: text }
            errorIfResult: "result !== 'Text block inside the frame'"

        - blank:
            description: Nested agent frame available
            run:
              - getText:
                  bindSelector: { selector: frameText }
                  result: { result: text }
                  errorIfResult: "result !== 'Text block inside the frame'"
```
#### Output:
```
00:00:00.000 - timer  Test 'frame' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
Frame support test (frame)
   (runnerSwitch)
   (goTo)
   No frame (blank)
      (getText)
   Get text from frame (blank)
      (getText)
      Nested agent frame available (blank)
         (getText)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (frame) Frame support test
00:00:00.000 - test   |   (runnerSwitch) Switch on runner: 'mainRunner'
00:00:00.000 - raw    |   |   Runner switch on 'mainRunner'
                      |   🕝: 00.000 s. (runnerSwitch)
00:00:00.000 - test   |   (goTo) Going on page http://localhost:3000/
00:00:00.000 - raw    |   |   Go to: http://localhost:3000/
                      |   🕝: 00.000 s. (goTo)
00:00:00.000 - test   |   (blank) No frame
00:00:00.000 - test   |   |   (getText) Get text from selector: '#simple-text'
00:00:00.000 - raw    |   |   |   Get text: 'Simple Text' from selector: '#simple-text'
                      |   |   🕝: 00.000 s. (getText)
                      |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (blank) Get text from frame
00:00:00.000 - test   |   |   (getText) Get text from selector: '#frame-text'
00:00:00.000 - raw    |   |   |   Get text: 'Text block inside the frame' from selector: '#frame-text'
                      |   |   🕝: 00.000 s. (getText)
00:00:00.000 - test   |   |   (blank) Nested agent frame available
00:00:00.000 - test   |   |   |   (getText) Get text from selector: '#frame-text'
00:00:00.000 - raw    |   |   |   |   Get text: 'Text block inside the frame' from selector: '#frame-text'
                      |   |   |   🕝: 00.000 s. (getText)
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (blank)
                      🕝: 00.000 s. (frame)
00:00:00.000 - timer  Test 'frame' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "frame": {}
}

```
## debug
Дебаггер для остановки агента в нужном месте

```yaml
name: debug
description: debug
run:
  - blank:
      description: "Simple debug"
      debug: true
```
#### Output:
```
00:00:00.000 - timer  Test 'debug' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env    
debug (debug)
   Simple debug (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (debug) debug
00:00:00.000 - test   |   (blank) Simple debug
                      |   🕝: 00.000 s. (blank)
                      🕝: 00.000 s. (debug)
00:00:00.000 - timer  Test 'debug' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "debug": {}
}

```

# Runner file

File with runner information. There is may more then one runner in test. You can switch between runners.

If there exist more then one runner with the same name they merge. Use in for development redefinition parts of runner in private runner file. I.e. for start electron app from your local files.

```yaml
name: mainRunner
type: runner
description: My runner

data:
  myEnvData: foo

selectors:
  myEnvSelectors: bar

dataExt:
  - dataExt
  - privateData

selectorsExt:
  - selectorsExt
  - privateSelectors

runnersExt:
  - privateEnv

browser:
  type: browser
  runtime: run
  engine: puppeteer
  browser: chrome
  args:
  - "--window-size=1024,768"
  headless: false
  slowMo: 5
  windowSize:
    width: 1024
    height: 768
  runtimeEnv:
    runtimeExecutable: optional
    program: optional
    cwd: optional
    args: optional
    env: optional
    secondsToStartApp: optional
    secondsDelayAfterStartApp: optional

log:
  level: raw
  screenshot: true
  fullpage: true
```

## Parameters

Parameter  | Description
------------- | -------------
name | Name of runner. Use it for running runners with [Running arguments](#running-arguments). Feel free for naming but with caution use spaces.
type | For runner files it should be `env`.
description | Description
data | Object with data for passing in this runner.
selectors | Object with selectors for passing in this runner.
dataExt | Array of data that extend this runner. Related to [PPD_ROOT and PPD_ROOT_ADDITIONAL](#running-arguments). You can use asterisk to load all files from folder `data/*`
selectorsExt | Array of selectors that extend this runner. Related to [PPD_ROOT and PPD_ROOT_ADDITIONAL](#running-arguments). You can use asterisk to load all files from folder `data/*`
runnersExt | Array of runners that extend this runner. Related to [PPD_ROOT and PPD_ROOT_ADDITIONAL](#running-arguments). You can use asterisk to load all files from folder `data/*`
browser | [Browser settings](#browser-settings)
log | [Logging settings](#logging-settings)

## Browser Settings
Parameter | Description | Default Value | Dependence
------------- | ------------- | -------------  | -------------
type | Engine target: `browser` - browser, `electron` - electron app | `browser`
engine | Type of engine: `puppeteer` - puppeteer, `playwright` - playwright | `playwright`
browser | Name of browser: `chromium`, `firefox`, `webkit` | `chromium`
runtime | `run` - run new browser instance, `connect` - connect to exist browser via [DevTools API](https://chromedevtools.github.io/devtools-protocol/) need `urlDevtoolsJson` parameter | `run` | `urlDevtoolsJson`
urlDevtoolsJson | Link to devtool server `http://127.0.0.1:9222/`. To start electron or chrome with this feature run it with arg `--remote-debugging-port=9222`. Use your port number. | | runtime is `connect`
args | Array of custom [Arguments](https://peter.sh/experiments/chromium-command-line-switches/) for Chrome
headless | Headless mode `false` - show browser. `true` - headless mode. If debug mode enabled in PuppeDo always Headless mode is `false` | `true` |`PPD_DEBUG_MODE`
slowMo | Delay before every action in milliseconds.| `0`
windowSize | Viewport size. Object `width, height` in px.
runtimeEnv | [runtimeEnv settings](#runtimeEnv-settings)
killOnEnd | Is close browser on end of tests. | `true`

## runtimeEnv Settings
Parameter  | Description
------------- | -------------
runtimeExecutable | todo
program | todo
cwd | todo
args | todo
env | todo
secondsToStartApp | todo
secondsDelayAfterStartApp | todo

## Logging Settings
Parameter  | Description
------------- | -------------
level | todo
screenshot | todo
fullpage | todo
screenshotName | todo
fullpageName | todo


# Data and Selectors files
```yaml
type: data
description: Simple Data
data:
  value: test
```

Parameter  | Description
------------- | -------------
type | `data` or `selectors`
description | Description
data | Object with data

<!--# Test files
#### Todo

# Test atoms files
#### Todo

# Socket
#### Todo

 # Editors Environment

## VSCode

## WebStorm

-->



<!-- # Old README

```
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run",
      "program": "${workspaceFolder}\\index.js",
      "args": [
        "--envs=[\"./json/envCloud.yaml\", \"./json/envElectron.yaml\", \"./json/envApi.yaml\"]",
        "--test=testGlob",
        "--output=output",
        "--testFolders=[\"tests\"]"
      ]
    }
  ]
```

```
---
name: login
type: test
needData:
- baseUrl
- auth.login
- auth.password
needSelectors:
- auth.inputLogin
- auth.inputPassword
- auth.submit
beforeTest:
- name: log
  text: TEST LOGIN START
  screenshot: true
  fullpage: true
  level: info
runTest:
- goTo:
    bindData: { url: baseUrl }
- typeInput:
    bindData: { text: auth.login }
    bindSelectors: { input: auth.inputLogin }
- name: typeInput
  bindData:
    text: auth.password
  bindSelectors:
    input: auth.inputPassword
- name: buttonClick
  bindSelectors:
    button: auth.submit
afterTest:
- name: log
  text: TEST LOGIN END
  screenshot: true
  fullpage: true
  level: info
```



# Настройка окружения

1. Установить NodeJS
2. Установить Python 2.7
3. запустить из консоли в папке ```npm i```
4. в папке privateData создать файл auth.yaml с подобным содержанием:
    ```
    auth:
        login: тут логин
        password: тут пароль
    ```
Вся информация из этой папки не будет уходить в репозиторий.

# Способы запуска

## VSCode

```
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Запустить программу",
      "args": [
        "-e",
        "require(\"PuppeDo\").main()"
      ],
      "env": {
        "PPD_TEST": "testGlob",
        "PPD_DATA_EXT": "[\"privateData/auth.yaml\"]"
      }
    }
  ]
```

## PyCharm

1. Настроить запуск с конфигурацией NodeJS
2. В аргументы прописать как в конфигурации VSCode (возможно не нужны \\" прокатит и просто ")
3. Переменные среды записать как в конфигурации VSCode

## Запуск с аргументами из коммандной строки

1. ```node -e require("PuppeDo").main()```
2. args
    - --tests - Список тестов для последовательного запуска, без выключения приложений
    - --output - Папка для логов (default: "output")
    - --envs - МАССИВ (это обязательно) со ссылками на файлы описание сред выполнения
    - --rootFolder - Папка с тестами (default: ".")
    - --runnersExt - Расширение значений envs (для CI)
        ```
        Пример:

        "privateData/envElectronRunExt.json"

        {
            "envElectronRun": {
                "browser.runtimeEnv.runtimeExecutable": "P:/DEV/cashdesk-electron/node_modules/.bin/electron.cmd",
                "browser.runtimeEnv.program": "P:/DEV/cashdesk-electron/index.js",
                "browser.runtimeEnv.cwd": "P:/DEV/cashdesk-electron/"
            }
        }
        ```
    - --data - Данные которые пробрасываются в тесты
    - --selectors - Селекторы которые пробрасываются в тесты
    - --dataExt - Массив с YAML файлами с данными (можно использовать * `data/Касса/Селекторы/*`)
    - --selectorsExt - Массив с YAML файлами с селекторами (можно использовать *)
    - --debugMode - true включает дебаг режим

## Запуск из скрипта JS

1. ``` node index.js ```
2. Внутри файла
    ```
    const main = require("PuppeDo").main;
    main({ args })
    ```

## Запуск с переменными среды

1. ```node -e require("PuppeDo").main()```
2. SET PPD_%=%data%
 -->

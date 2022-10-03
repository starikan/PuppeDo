# PuppeDo

Puppeteer tests flow with node.js


# Installation

## Windows

  1. Install [NodeJS](https://nodejs.org/)

      * you can use [Nodist](https://github.com/nullivex/nodist/)

  1. Fetch node modules with `npm install` or `yarn`
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
PPD_LOG_TEST_NAME | Show in log name of test on every line | `true` | `Boolean`
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
   ```name:``` [PPD_ROOT and PPD_ROOT_ADDITIONAL](#running-arguments)

   ```description:```

   ```skipSublingIfResult:```

   ```continueOnError:```

   ```argsRedefine:```

## skipSublingIfResult
TODO

```yaml
name: skipSublingIfResult
description: "skipSublingIfResult"
runTest:
  - case:
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

  - case:
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

  - case:
      description: "If true with skipSublingIfResult"
      runTest:
        - blank:
            if: "1 === 1"
            description: "Skip after me"
            skipSublingIfResult: "1 === 1"

        - blank:
            description: "❌ I`m skiped"

  - case:
      description: "If false with skipSublingIfResult"
      runTest:
        - blank:
            if: "1 !== 1"
            description: "Skip after me"
            skipSublingIfResult: "1 === 1"

        - blank:
            description: "✔️ I`m not skiped"

  - case:
      description: ✔️ I`m not skiped. On higher level.

```
#### Output:
```
00:00:00.000 - timer  Test 'skipSublingIfResult' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env
skipSublingIfResult (skipSublingIfResult)
   Simple skipSublingIfResult (case)
      ✔️ I`m not skiped (blank)
      Skip after me (blank)
      ❌ I`m skiped (blank)
      ❌ I`m skiped too (blank)
   Loop with skipSublingIfResult (case)
      I`m first (blank)
      (blank)
      I`m next (skiped in #2 repeate) (blank)
      I`m next too (skiped in #2 repeate) (blank)
   If true with skipSublingIfResult (case)
      Skip after me (blank)
      ❌ I`m skiped (blank)
   If false with skipSublingIfResult (case)
      Skip after me (blank)
      ✔️ I`m not skiped (blank)
   ✔️ I`m not skiped. On higher level. (case)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (skipSublingIfResult) skipSublingIfResult
00:00:00.000 - test   |   (case) Simple skipSublingIfResult
00:00:00.000 - test   |   |   (blank) ✔️ I`m not skiped
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Skip after me
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - raw    |   |   Skip with skipSublingIfResult: (blank) ❌ I`m skiped
00:00:00.000 - raw    |   |   Skip with skipSublingIfResult: (blank) ❌ I`m skiped too
                      |   🕝: 00.000 s. (case)
00:00:00.000 - test   |   (case) Loop with skipSublingIfResult
00:00:00.000 - test   |   |   (blank) I`m first
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Only repeat #2 Skip Subling. Loop: 3
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next (skiped in #2 repeate)
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next too (skiped in #2 repeate)
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (case) Loop with skipSublingIfResult
00:00:00.000 - test   |   |   (blank) I`m first
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Only repeat #2 Skip Subling. Loop: 2
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - raw    |   |   Skip with skipSublingIfResult: (blank) I`m next (skiped in #2 repeate)
00:00:00.000 - raw    |   |   Skip with skipSublingIfResult: (blank) I`m next too (skiped in #2 repeate)
00:00:00.000 - test   |   (case) Loop with skipSublingIfResult
00:00:00.000 - test   |   |   (blank) I`m first
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) Only repeat #2 Skip Subling. Loop: 1
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next (skiped in #2 repeate)
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next too (skiped in #2 repeate)
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (case)
                      |   🕝: 00.000 s. (case)
                      |   🕝: 00.000 s. (case)
00:00:00.000 - test   |   (case) If true with skipSublingIfResult
00:00:00.000 - test   |   |   (blank) Skip after me
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - raw    |   |   Skip with skipSublingIfResult: (blank) ❌ I`m skiped
                      |   🕝: 00.000 s. (case)
00:00:00.000 - test   |   (case) If false with skipSublingIfResult
00:00:00.000 - info   |   |   Skip with IF expr '1 !== 1' === 'false'
00:00:00.000 - test   |   |   (blank) ✔️ I`m not skiped
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (case)
00:00:00.000 - test   |   (case) ✔️ I`m not skiped. On higher level.
                      |   🕝: 00.000 s. (case)
                      🕝: 00.000 s. (skipSublingIfResult)
00:00:00.000 - timer  Test 'skipSublingIfResult' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "skipSublingIfResult": {}
}

```
## continueOnError
TODO

```yaml
name: continueOnError
description: continueOnError
runTest:
  - case:
      description: Skip me if I broken
      continueOnError: true
      runTest:
        - blank:
            errorIfResult: 1 === 1
            descriptionError: This is error description

  - case:
      repeat: 3
      continueOnError: true
      runTest:
        - blank:
            bindDescription: "`Second level loop: ${$loop}`"
            errorIfResult: "$loop < 2"

        - blank:
            description: "I`m next"

  - case:
      description: I am without errors

  - case:
      description: Error me if I broken
      continueOnError: true
      runTest:
        - blank:
            argsRedefine:
              PPD_CONTINUE_ON_ERROR_ENABLED: false
            errorIfResult: 1 === 1
            descriptionError: This is error because PPD_CONTINUE_ON_ERROR_ENABLED is False

```
#### Output:
```
00:00:00.000 - timer  Test 'continueOnError' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env
continueOnError (continueOnError)
   Skip me if I broken (case)
      (blank)
   (case)
      (blank)
      I`m next (blank)
   I am without errors (case)
   Error me if I broken (case)
      (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (continueOnError) continueOnError
00:00:00.000 - test   |   (case) Skip me if I broken
00:00:00.000 - test   |   |   (blank) TODO: Fill description
00:00:00.000 - warn   |   |   Continue: Test stopped with expr errorIfResult = '1 === 1'
00:00:00.000 - test   |   (case) TODO: Fill description
00:00:00.000 - test   |   |   (blank) Second level loop: 3
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (case) TODO: Fill description
00:00:00.000 - test   |   |   (blank) Second level loop: 2
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   |   (blank) I`m next
                      |   |   🕝: 00.000 s. (blank)
00:00:00.000 - test   |   (case) TODO: Fill description
00:00:00.000 - test   |   |   (blank) Second level loop: 1
00:00:00.000 - warn   |   |   Continue: Test stopped with expr errorIfResult = '$loop < 2'
                      |   🕝: 00.000 s. (case)
                      |   🕝: 00.000 s. (case)
00:00:00.000 - test   |   (case) I am without errors
                      |   🕝: 00.000 s. (case)
00:00:00.000 - test   |   (case) Error me if I broken
00:00:00.000 - test   |   |   (blank) TODO: Fill description
00:00:00.000 - error  |   |   |   Test stopped with expr errorIfResult = '1 === 1'
00:00:00.000 - error  |   |   |    continueOnError
00:00:00.000 - error  |   |   |       runTest[3].case
00:00:00.000 - error  |   |   |          runTest[0].blank
00:00:00.000 - error  |   |   |    =======================================================================================
00:00:00.000 - error  |   |   This is error because PPD_CONTINUE_ON_ERROR_ENABLED is False | Description: No test description (blank)
00:00:00.000 - error  |   |    continueOnError
00:00:00.000 - error  |   |       runTest[3].case
00:00:00.000 - error  |   |          runTest[0].blank
00:00:00.000 - error  |   |    (file:///\@puppedo\atoms\src\blank\blank.yaml)
00:00:00.000 - error  |   |    ==========================================================================================
00:00:00.000 - warn   |   Continue: Test stopped with expr errorIfResult = '1 === 1' || error in test = blank
00:00:00.000 - timer  Test 'continueOnError' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "continueOnError": {}
}

```
## argsRedefine
TODO

```yaml
name: argsRedefine
description: argsRedefine check

runTest:
  - case:
      description: Check PPD_LOG_EXTEND true globaly
      runTest:
        - blank:

  - case:
      description: Redefine PPD_LOG_TIMER_SHOW to false
      argsRedefine:
        PPD_LOG_TIMER_SHOW: false
      runTest:
        - blank:
            argsRedefine:
              PPD_LOG_TIMER_SHOW: false

  - case:
      description: Redefine PPD_LOG_TIMER_SHOW to false for parent only (not propogate to child)
      argsRedefine:
        PPD_LOG_TIMER_SHOW: false
      runTest:
        - blank:

```
#### Output:
```
00:00:00.000 - timer  Test 'argsRedefine' start on '0000-00-00_00-00-00.000'
00:00:00.000 - env
argsRedefine check (argsRedefine)
   Check PPD_LOG_EXTEND true globaly (case)
      (blank)
   Redefine PPD_LOG_TIMER_SHOW to false (case)
      (blank)
   Redefine PPD_LOG_TIMER_SHOW to false for parent only (not propogate to child) (case)
      (blank)

00:00:00.000 - timer  Prepare time 🕝: 00.000 s.
00:00:00.000 - test   (argsRedefine) argsRedefine check
00:00:00.000 - test   |   (case) Check PPD_LOG_EXTEND true globaly
00:00:00.000 - test   |   |   (blank) TODO: Fill description
                      |   |   🕝: 00.000 s. (blank)
                      |   🕝: 00.000 s. (case)
00:00:00.000 - test   |   (case) Redefine PPD_LOG_TIMER_SHOW to false
00:00:00.000 - test   |   |   (blank) TODO: Fill description
00:00:00.000 - test   |   (case) Redefine PPD_LOG_TIMER_SHOW to false for parent only (not propogate to child)
00:00:00.000 - test   |   |   (blank) TODO: Fill description
                      |   |   🕝: 00.000 s. (blank)
                      🕝: 00.000 s. (argsRedefine)
00:00:00.000 - timer  Test 'argsRedefine' time 🕝: 00.000 s.
00:00:00.000 - timer  Evaluated time 🕝: 00.000 s.
{
  "argsRedefine": {}
}

```

# Environment files

File with environment information. There is may more then one env in test. You can switch between envs.

If there exist more then one env with the same name they merge. Use in for development redefinition parts of env in private env file. I.e. for running electron app from your local files.

```yaml
name: mainEnv
type: env
description: My env

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

envsExt:
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
name | Name of environment. Use it for running envs with [Running arguments](#running-arguments). Feel free for naming but with caution use spaces.
type | For environment files it should be `env`.
description | Description
data | Object with data for passing in this env.
selectors | Object with selectors for passing in this env.
dataExt | Array of data that extend this env. Related to [PPD_ROOT and PPD_ROOT_ADDITIONAL](#running-arguments). You can use asterisk to load all files from folder `data/*`
selectorsExt | Array of selectors that extend this env. Related to [PPD_ROOT and PPD_ROOT_ADDITIONAL](#running-arguments). You can use asterisk to load all files from folder `data/*`
envsExt | Array of envs that extend this env. Related to [PPD_ROOT and PPD_ROOT_ADDITIONAL](#running-arguments). You can use asterisk to load all files from folder `data/*`
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
    - --envsExt - Расширение значений envs (для CI)
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

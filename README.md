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

## Environment files

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
  type: puppeteer
  runtime: run
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
    pauseAfterStartApp: optional

log:
  level: raw
  screenshot: true
  fullpage: true
```

### Parameters

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

### Browser Settings
Parameter | Description | Default Value | Dependence
------------- | ------------- | -------------  | -------------
type | Type of browser: `puppeteer` - chrome browser, `electron` - electron app | `puppeteer`
runtime | `run` - run new browser instance, `connect` - connect to exist browser via [DevTools API](https://chromedevtools.github.io/devtools-protocol/) need `urlDevtoolsJson` parameter | `run` | `urlDevtoolsJson`
urlDevtoolsJson | Link to devtool server `http://127.0.0.1:9222/`. To start electron or chrome with this feature run it with arg `--remote-debugging-port=9222`. Use your port number. | | runtime is `connect`
args | Array of custom [Arguments](https://peter.sh/experiments/chromium-command-line-switches/) for Chrome
headless | Headless mode `false` - show browser. `true` - headless mode. If debug mode enabled in PuppeDo always Headless mode is `false` | `true` |`PPD_DEBUG_MODE`
slowMo | Delay before every action in milliseconds.| `0`
windowSize | Viewport size. Object `width, height` in px.
runtimeEnv | [runtimeEnv settings](#runtimeEnv-settings)
killOnEnd | Is close browser on end of tests. | `true`

### runtimeEnv Settings
Parameter  | Description
------------- | -------------
runtimeExecutable | todo
program | todo
cwd | todo
args | todo
env | todo
pauseAfterStartApp | todo

### Logging Settings
Parameter  | Description
------------- | -------------
level | todo
screenshot | todo
fullpage | todo

# Data and Selectors files
```yaml
type: data
description: Simple Data
needEnv: mainEnv
data:
  value: test
```

Parameter  | Description
------------- | -------------
type | `data` or `selectors`
description | Description
data | Object with data

# Test files
#### Todo

# Test atoms files
#### Todo

# Running Arguments
Parameter | Description | Default Value | Type
------------- | ------------- | ------------- | -------------
PPD_ROOT | Root folder of tests | `process.cwd()` | `String`
PPD_ROOT_ADDITIONAL | Append folders of tests and stuff | `[]` | `String[]`
PPD_ROOT_IGNORE | Ignore folders of tests starts with | `['.git', 'node_modules', '.history']` | `String[]`
PPD_ENVS | Links of environments to run. | `[]` | `String[]`
PPD_TESTS | Name of tests to run one by one | `[]` | `String[]`
PPD_DATA | Object with data | `{}` | `Object`
PPD_SELECTORS | Object with selectors | `{}` | `Object`
PPD_OUTPUT | Path to log folder | `output` | `String`
PPD_DEBUG_MODE | Debug mode | `false` | `Boolean`
PPD_LOG_DISABLED | Disable logging | `false` | `Boolean`
PPD_LOG_TIMER | Log every atoms time for tuning and breadcrumbs for test | `false` | `Boolean`
PPD_LOG_LEVEL_NESTED | Log only nested levels of log bellow this. `0` - log all | `0` | `Number`
PPD_DISABLE_ENV_CHECK | If true then needEnv directive ignore | `false` | `Boolean`

Arguments applying order. From minor to major:
1. Defaults
1. CLI arguments
1. ENV variables
1. Arguments from script

# Socket
#### Todo

# RoadMap 2.0.0

1. Rename 'PPD_LOG_TIMER' -> 'PPD_LOG_EXTEND' (+ atoms-core)
<!-- # Editors Environment

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
needEnv:
- cloud
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
        "PPD_ENVS": "[\"settings/envCloud.yaml\"]",
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
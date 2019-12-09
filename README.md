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

## Environment files

Save this data in any place in folder [PPD_TEST_FOLDER](#runing-arguments)

If there exist more then one env with the same name they merge. Use in for development redefinition parts of env in private env file. I.e. for runing electron app from your local files.

```yaml
name: mainEnv
type: env

data:
  myEnvData: foo

selectors:
  myEnvSelectors: bar

dataExt:
  - data/data.yaml

selectorsExt:
  - data/selectors.yaml

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

### Parametrs

Parametr  | Description
------------- | -------------
name | Name of environment. Use it for runing envs with [Runing arguments](#runing-arguments). Feel free for naming but with caution use spaces.
type | For environment files it shoud be `env`.
data | Object with data for passing in this env.
selectors | Object with selectors for passing in this env.
dataExt | Array of files with data. Related to [PPD_TEST_FOLDER](#runing-arguments). You can use asterisk to load all files from folder `data/*`
selectorsExt | Array of files with selectors. Related to [PPD_TEST_FOLDER](#runing-arguments). You can use asterisk to load all files from folder `data/*`
browser | [Browser settings](#browser-settings)
log | [Logging settings](#logging-settings)

### Browser Settings
Parametr  | Description
------------- | -------------
type | Type of browser: `puppeteer` - chrome browser (default), `electron` - electron app
runtime | `run` - run new browser instanse (default), `connect` - connect to exist browser via [DevTools API](https://chromedevtools.github.io/devtools-protocol/) need `urlDevtoolsJson` parametr
urlDevtoolsJson | if runtime is `connect` link to devtool server `http://127.0.0.1:9222/`. To start electron or chrome with this feature run it with arg `--remote-debugging-port=9222`. Use your port number.
args | Array of custom [Arguments](https://peter.sh/experiments/chromium-command-line-switches/) for Chrome
headless | Headless mode `false` - show browser. `true` - headless mode (default). If debug mode enabled in PuppeDo always Headless mode is `false`
slowMo | Dellay before every action in millisecconds. (default: 0)
windowSize | Viewport size. Object `width, height` in px.
runtimeEnv | [runtimeEnv settings](#runtimeEnv-settings)
killOnEnd | Is close browser on end of tests `true` default.

### runtimeEnv Settings
Parametr  | Description
------------- | -------------
runtimeExecutable | todo
program | todo
cwd | todo
args | todo
env | todo
pauseAfterStartApp | todo

### Logging Settings
Parametr  | Description
------------- | -------------
level | todo
screenshot | todo
fullpage | todo

# Data and Selectors files
#### Todo

# Test files
#### Todo

# Test atoms files
#### Todo

# Runing Arguments
Parametr | Description
------------- | -------------
PPD_TEST_FOLDER | todo
PPD_OUTPUT | todo
PPD_ENVS | todo
PPD_TESTS | todo
PPD_DATA | todo
PPD_SELECTORS | todo
PPD_EXT_FILES | todo
PPD_DEBUG_MODE | todo
PPD_LOG_DISABLED | todo
PPD_LOG_DISABLED | todo

# Socket
#### Todo

<!-- # Editors Environment

## VSCode

## WebStorm

#### TODO -->



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
    - --testsFolder - Папка с тестами (default: ".")
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
3. args:
    - test
    - tests
    - output
    - envs
    - testsFolder
    - envsExt
    - envsExtJson
    - data
    - selectors
    - dataExt
    - selectorsExt
    - debugMode
    - logDisabled

## Запуск с переменными среды

1. ```node -e require("PuppeDo").main()```
2. SET PPD_%=%data%

3. env: // Все в двойный кавычках "", если внутри они нужны нужно их эскейпить \" т.к. все потом парсится как JSON
    - PPD_TEST
    - PPD_TESTS
    - PPD_OUTPUT
    - PPD_ENVS
    - PPD_TEST_FOLDER
    - PPD_ENVS_EXT
    - PPD_ENVS_EXT_JSON
    - PPD_DATA
    - PPD_SELECTORS
    - PPD_DATA_EXT
    - PPD_SELECTORS_EXT
    - PPD_DEBUG_MODE
    - PPD_LOG_DISABLED -->
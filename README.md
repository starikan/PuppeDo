# PuppeDo
Puppeteer tests flow with node.js

Imstall NodeJS v10.4.0

```
npm install
```

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

envCloud.yaml
```
---
name: cloud
data:
  baseUrl: https://***.***.***/
  urls: {}
  auth:
    login: ***
    password: ***
selectors:
  auth:
    inputLogin: "#username"
    inputPassword: "#password"
    submit: button[type='submit']
browser:
  type: puppeteer
  runtime: run
  args:
  - "--window-size=1024,918"
  headless: false
  slowMo: 10
  windowSize:
    width: 1024
    height: 768
log:
  level: debug
  screenshot: true
  fullpage: true
```

envElectron.yaml
```
---
name: electron
data:
  baseUrl: https://***.***.***/
  urls: {}
  auth:
    login: ***
    password: ***
selectors:
  auth:
    inputLogin: "#username"
    inputPassword: "#password"
    inputSubmit: button[type='submit']
browser:
  type: puppeteer
  runtime: connect
log:
  level: debug
  screenshot: true
  fullpage: true
headless: false
slowMo: 100
```

envApi.yaml
```
---
name: api
data:
  baseUrl: https://***.***.***/
  auth:
    login: ***
    password: ***
selectors: {}
browser:
  type: api
log:
  level: debug
  screenshot: true
  fullpage: true
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
    - --test - Тест который нужно запускать
    - --testsList - Список тестов для последовательного запуска, без выключения приложений
    - --output - Папка для логов (default: "output")
    - --envs - МАССИВ (это обязательно) со ссылками на файлы описание сред выполнения
    - --testsFolder - Папка с тестами (default: ".")
    - --envsExt - Расширение значений envs (для CI)
        ```
        Пример:

        envsExt: {
            envElectron: { // Имя файла среды без .yaml
                // Полные пути к переменным которые надо заменить
                'browser.runtimeEnv.runtimeExecutable': '%electronPath%',
                'browser.runtimeEnv.program': '%scriptPath%',
            }
        }
        ```
    - --data - Данные которые пробрасываются в тесты
    - --selectors - Селекторы которые пробрасываются в тесты
    - --dataExt - Массив с YAML файлами с данными
    - --selectorsExt - Массив с YAML файлами с селекторами
    - --debugMode - true включает дебаг режим

## Запуск из скрипта JS

1. ``` node index.js ```
2. Внутри файла
    ```
    const = require("PuppeDo").main;
    main({ args })
    ```
3. args:
    - test
    - testsList
    - output
    - envs
    - testsFolder
    - envsExt
    - data
    - selectors
    - dataExt
    - selectorsExt
    - debugMode

## Запуск с переменными среды

1. ```node -e require("PuppeDo").main()```
2. SET PPD_%=%data%

3. env: // Все в двойный кавычках "", если внутри они нужны нужно их эскейпить \" т.к. все потом парсится как JSON
    - PPD_TEST
    - PPD_TESTS_LIST
    - PPD_OUTPUT
    - PPD_ENVS
    - PPD_TEST_FOLDER
    - PPD_ENVS_EXT
    - PPD_DATA
    - PPD_SELECTORS
    - PPD_DATA_EXT
    - PPD_SELECTORS_EXT
    - PPD_DEBUG_MODE
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
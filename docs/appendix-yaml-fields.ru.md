# Приложение: Поля YAML, поддерживаемые PuppeDo

Этот список описывает все поля, которые могут встречаться в YAML-агентах PuppeDo (test/atom/runner/data/selectors) и в конфигурации runner.

## Таблица полей

### Базовые поля агента
| Название | Назначение | Тип | Ограничения | Пример |
| --- | --- | --- | --- | --- |
| `name` | Имя агента | `string` | Обязательное; уникальное в пределах загруженных файлов | [Пример](docs/appendix-yaml-fields.ru.md#пример-name) |
| `type` | Тип агента | `string` | Опционально; типы: `test`, `atom`, `runner`, `data`, `selectors`, `agent` | [Пример](docs/appendix-yaml-fields.ru.md#пример-type) |
| `description` | Краткое описание шага/агента | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-description) |
| `descriptionExtend` | Расширенное описание шагов (для режима документации) | `string[]` | Опционально; выводится только при `PPD_LOG_DOCUMENTATION_MODE=true` | [Пример](docs/appendix-yaml-fields.ru.md#пример-descriptionextend) |
| `bindDescription` | Динамическое описание через выражение | `string` | JS-выражение; ошибка вычисления не падает | [Пример](docs/appendix-yaml-fields.ru.md#пример-binddescription) |
| `todo` | Комментарий/задача для шага | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-todo) |
| `disable` | Полное отключение шага | `boolean` | `true` — шаг пропускается | [Пример](docs/appendix-yaml-fields.ru.md#пример-disable) |
| `tags` | Теги агента | `string[]` | Фильтруется `PPD_TAGS_TO_RUN` | [Пример](docs/appendix-yaml-fields.ru.md#пример-tags) |
| `debugInfo` | Лог отладочной информации | `boolean \| "data" \| "selectors"` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-debuginfo) |
| `argsRedefine` | Локальное переопределение `PPD_*` аргументов | `Partial<ArgumentsType>` | Работает как плагин; наследуется | [Пример](docs/appendix-yaml-fields.ru.md#пример-argsredefine) |
| `debug` | Точка отладки | `boolean` | Работает только при `PPD_DEBUG_MODE=true` | [Пример](docs/appendix-yaml-fields.ru.md#пример-debug) |
| `logOptions` | Настройки логирования шага | `LogOptionsType` | Объект настроек; видимость зависит от `PPD_LOG_IGNORE_HIDE_LOG` | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions) |
| `logOptions.logThis` | Логировать сам шаг | `boolean` | Может быть переопределено родителем; учитывает `PPD_LOG_IGNORE_HIDE_LOG` | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-logthis) |
| `logOptions.logChildren` | Логировать дочерние шаги | `boolean` | Наследуется вниз; учитывает `PPD_LOG_IGNORE_HIDE_LOG` | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-logchildren) |
| `logOptions.logShowFlag` | Итоговый флаг видимости | `boolean` | Рассчитывается плагином; учитывает `PPD_LOG_IGNORE_HIDE_LOG` | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-logshowflag) |
| `logOptions.screenshot` | Скриншот элемента | `boolean` | Требуются `needSelectors` | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-screenshot) |
| `logOptions.fullpage` | Скриншот всей страницы | `boolean` | Работает при `logOptions.screenshot` или напрямую | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-fullpage) |
| `logOptions.screenshotName` | Имя файла скриншота | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-screenshotname) |
| `logOptions.fullpageName` | Имя файла fullpage-скриншота | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-fullpagename) |
| `logOptions.level` | Уровень/цвет логов | `ColorsType` | Значения: `sane`, `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `raw`, `timer`, `debug`, `info`, `test`, `warn`, `error`, `trace`, `env` | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-level) |
| `logOptions.textColor` | Цвет текста | `ColorsType` | Значения как у `logOptions.level` | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-textcolor) |
| `logOptions.backgroundColor` | Цвет фона | `ColorsType` | Значения как у `logOptions.level` | [Пример](docs/appendix-yaml-fields.ru.md#пример-logoptions-backgroundcolor) |
| `options` | Произвольные опции шага | `Record<string, string \| number>` | Наследуются вниз | [Пример](docs/appendix-yaml-fields.ru.md#пример-options) |
| `allowOptions` | Разрешённые опции | `string[]` | Ограничивает набор `options` у потомков | [Пример](docs/appendix-yaml-fields.ru.md#пример-allowoptions) |

### Данные, селекторы и результаты
| Название | Назначение | Тип | Ограничения | Пример |
| --- | --- | --- | --- | --- |
| `data` | Локальные данные | `Record<string, unknown>` | Объект; переопределяет унаследованные ключи | [Пример](docs/appendix-yaml-fields.ru.md#пример-data) |
| `dataExt` | Подключение внешних data-агентов | `string[]` | Имена `type: data` | [Пример](docs/appendix-yaml-fields.ru.md#пример-dataext) |
| `bindData` | Вычисляемые данные | `Record<string, string>` | JS-выражения; ошибка вычисления оставляет строку | [Пример](docs/appendix-yaml-fields.ru.md#пример-binddata) |
| `needData` | Обязательные данные | `string[]` | Поддерживает `?` для опциональных ключей | [Пример](docs/appendix-yaml-fields.ru.md#пример-needdata) |
| `selectors` | Локальные селекторы | `Record<string, unknown>` | Объект; наследуется плагином `selectors` | [Пример](docs/appendix-yaml-fields.ru.md#пример-selectors) |
| `selectorsExt` | Подключение внешних selectors-агентов | `string[]` | Имена `type: selectors` | [Пример](docs/appendix-yaml-fields.ru.md#пример-selectorsext) |
| `bindSelectors` | Вычисляемые селекторы | `Record<string, string>` | JS-выражения | [Пример](docs/appendix-yaml-fields.ru.md#пример-bindselectors) |
| `needSelectors` | Обязательные селекторы | `string[]` | Поддерживает `?` для опциональных ключей | [Пример](docs/appendix-yaml-fields.ru.md#пример-needselectors) |
| `needEnvParams` | Обязательные переменные окружения | `string[]` | Поддерживает `?` для опциональных ключей; иначе ошибка | [Пример](docs/appendix-yaml-fields.ru.md#пример-needenvparams) |
| `allowResults` | Разрешённые ключи результатов | `string[]` | При задании — результаты должны содержать все ключи | [Пример](docs/appendix-yaml-fields.ru.md#пример-allowresults) |
| `bindResults` | Вычисление/сохранение результатов | `Record<string, string>` | JS-выражения; вычисляются после шага | [Пример](docs/appendix-yaml-fields.ru.md#пример-bindresults) |

### Управление выполнением
| Название | Назначение | Тип | Ограничения | Пример |
| --- | --- | --- | --- | --- |
| `repeat` | Количество повторений | `number \| string` | Может быть выражением; приводится к числу | [Пример](docs/appendix-yaml-fields.ru.md#пример-repeat) |
| `while` | Условие цикла | `string` | JS-выражение; при `true` увеличивает `repeat` | [Пример](docs/appendix-yaml-fields.ru.md#пример-while) |
| `if` | Условное выполнение | `string` | JS-выражение; при `false` шаг пропускается | [Пример](docs/appendix-yaml-fields.ru.md#пример-if) |
| `errorIf` | Ошибка до выполнения шага | `string` | JS-выражение; при `true` выбрасывает ошибку | [Пример](docs/appendix-yaml-fields.ru.md#пример-errorif) |
| `errorIfResult` | Ошибка после выполнения шага | `string` | JS-выражение; доступ к результатам шага | [Пример](docs/appendix-yaml-fields.ru.md#пример-errorifresult) |
| `descriptionError` | Текст ошибки из выражения | `string` | JS-выражение; вычисляется после результата | [Пример](docs/appendix-yaml-fields.ru.md#пример-descriptionerror) |
| `skipSublingIfResult` | Пропуск следующих шагов | `string` | JS-выражение; при `true` пропускает соседей | [Пример](docs/appendix-yaml-fields.ru.md#пример-skipsublingifresult) |
| `breakParentIfResult` | Прерывание родительского цикла | `string` | JS-выражение; при `true` прерывает уровень выше | [Пример](docs/appendix-yaml-fields.ru.md#пример-breakparentifresult) |
| `continueOnError` | Продолжение при ошибке | `boolean` | Учитывается только при `PPD_CONTINUE_ON_ERROR_ENABLED=true` | [Пример](docs/appendix-yaml-fields.ru.md#пример-continueonerror) |
| `engineSupports` | Ограничение по движку | `("playwright" \| "puppeteer")[]` | Ошибка, если текущий движок не поддержан | [Пример](docs/appendix-yaml-fields.ru.md#пример-enginesupports) |
| `frame` | Целевой фрейм | `string` | CSS/XPath селектор фрейма | [Пример](docs/appendix-yaml-fields.ru.md#пример-frame) |

### Жизненный цикл и код
| Название | Назначение | Тип | Ограничения | Пример |
| --- | --- | --- | --- | --- |
| `beforeRun` | Этап жизненного цикла | `Array<unknown>` | Имя по умолчанию; список шагов; набор этапов задаётся `PPD_LIFE_CYCLE_FUNCTIONS` | [Пример](docs/appendix-yaml-fields.ru.md#пример-beforerun) |
| `run` | Этап жизненного цикла | `Array<unknown>` | Имя по умолчанию; список шагов; набор этапов задаётся `PPD_LIFE_CYCLE_FUNCTIONS` | [Пример](docs/appendix-yaml-fields.ru.md#пример-run) |
| `afterRun` | Этап жизненного цикла | `Array<unknown>` | Имя по умолчанию; список шагов; набор этапов задаётся `PPD_LIFE_CYCLE_FUNCTIONS` | [Пример](docs/appendix-yaml-fields.ru.md#пример-afterrun) |
| `inlineJS` | Встроенный JS код | `string` | Выполняется в контексте шага | [Пример](docs/appendix-yaml-fields.ru.md#пример-inlinejs) |

### Runner: подключение и конфигурация
| Название | Назначение | Тип | Ограничения | Пример |
| --- | --- | --- | --- | --- |
| `runnersExt` | Подключение внешних runners | `string[]` | Имена runner-описаний | [Пример](docs/appendix-yaml-fields.ru.md#пример-runnersext) |
| `browser` | Конфигурация браузера | `EnvBrowserType` | Объект; обязателен для runner | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser) |
| `browser.type` | Тип запуска браузера | `"browser" \| "electron"` | Обязательное поле runner | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-type) |
| `browser.engine` | Движок | `"playwright" \| "puppeteer"` | Обязательное поле runner | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-engine) |
| `browser.browserName` | Имя браузера | `"chrome" \| "chromium" \| "firefox" \| "webkit"` | Обязательное поле runner | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-browsername) |
| `browser.runtime` | Режим работы | `"run" \| "connect"` | Обязательное поле runner | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtime) |
| `browser.executablePath` | Путь к бинарнику | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-executablepath) |
| `browser.headless` | Headless-режим | `boolean` | Обязательное поле runner | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-headless) |
| `browser.slowMo` | Замедление действий (мс) | `number` | Обязательное поле runner | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-slowmo) |
| `browser.args` | Аргументы запуска | `string[]` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-args) |
| `browser.urlDevtoolsJson` | URL devtools JSON | `string` | Используется при `runtime: connect` | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-urldevtoolsjson) |
| `browser.windowSize` | Размер окна | `{ width?: number; height?: number }` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-windowsize) |
| `browser.windowSize.width` | Ширина окна | `number` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-windowsize-width) |
| `browser.windowSize.height` | Высота окна | `number` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-windowsize-height) |
| `browser.killOnEnd` | Завершать процесс браузера | `boolean` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-killonend) |
| `browser.killProcessName` | Имя процесса для kill | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-killprocessname) |
| `browser.runtimeEnv` | Настройка запуска внешнего приложения | `RuntimeEnv` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtimeenv) |
| `browser.runtimeEnv.runtimeExecutable` | Путь к runtime | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtimeenv-runtimeexecutable) |
| `browser.runtimeEnv.program` | Путь к программе | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtimeenv-program) |
| `browser.runtimeEnv.cwd` | Рабочая папка | `string` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtimeenv-cwd) |
| `browser.runtimeEnv.args` | Аргументы программы | `string[]` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtimeenv-args) |
| `browser.runtimeEnv.env` | Переменные окружения | `Record<string, string>` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtimeenv-env) |
| `browser.runtimeEnv.secondsToStartApp` | Ожидание запуска (сек) | `number` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtimeenv-secondstostartapp) |
| `browser.runtimeEnv.secondsDelayAfterStartApp` | Пауза после запуска (сек) | `number` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-runtimeenv-secondsdelayafterstartapp) |
| `browser.timeout` | Таймаут запуска (мс) | `number` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-browser-timeout) |

### Runner: логирование
| Название | Назначение | Тип | Ограничения | Пример |
| --- | --- | --- | --- | --- |
| `log` | Настройки логирования runner | `{ level?: ColorsType; screenshot?: boolean; fullpage?: boolean }` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-log) |
| `log.level` | Уровень логов runner | `ColorsType` | Значения как у `logOptions.level` | [Пример](docs/appendix-yaml-fields.ru.md#пример-log-level) |
| `log.screenshot` | Скриншоты на уровне runner | `boolean` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-log-screenshot) |
| `log.fullpage` | Fullpage-скриншоты runner | `boolean` | Опционально | [Пример](docs/appendix-yaml-fields.ru.md#пример-log-fullpage) |

## Примеры

### Пример: name
```yaml
name: loginTest
run:
  - blank:
```

### Пример: type
```yaml
name: appSelectors
type: selectors
data:
  loginButton: "#login"
```

### Пример: description
```yaml
name: loginTest
description: "Проверка авторизации"
run:
  - blank:
```

### Пример: descriptionExtend
```yaml
name: loginTest
descriptionExtend:
  - "Открыть страницу"
  - "Ввести логин"
run:
  - blank:
```

### Пример: bindDescription
```yaml
name: dynamicDesc
bindDescription: "'Статус: ' + status"
run:
  - blank:
```

### Пример: needData
```yaml
name: needDataSample
needData: [username, password]
run:
  - blank:
```

### Пример: needSelectors
```yaml
name: needSelectorsSample
needSelectors: [loginButton]
run:
  - blank:
```

### Пример: needEnvParams
```yaml
name: needEnvSample
needEnvParams: [API_TOKEN]
run:
  - blank:
```

### Пример: dataExt
```yaml
name: dataExtSample
dataExt: [commonData]
run:
  - blank:
```

### Пример: selectorsExt
```yaml
name: selectorsExtSample
selectorsExt: [commonSelectors]
run:
  - blank:
```

### Пример: allowResults
```yaml
name: allowResultsSample
allowResults: [total]
run:
  - blank:
```

### Пример: todo
```yaml
name: todoSample
todo: "добавить проверку таймера"
run:
  - blank:
```

### Пример: debugInfo
```yaml
name: debugInfoSample
debugInfo: true
run:
  - blank:
```

### Пример: disable
```yaml
name: disabledSample
disable: true
run:
  - blank:
```

### Пример: data
```yaml
name: dataSample
data:
  baseUrl: "https://example.com"
run:
  - blank:
```

### Пример: bindData
```yaml
name: bindDataSample
data:
  baseUrl: "https://example.com"
bindData:
  loginUrl: "baseUrl + '/login'"
run:
  - blank:
```

### Пример: selectors
```yaml
name: selectorsSample
selectors:
  loginButton: "#login"
run:
  - blank:
```

### Пример: bindSelectors
```yaml
name: bindSelectorsSample
data:
  idx: 2
bindSelectors:
  row: "'table tr:nth-child(' + idx + ')'"
run:
  - blank:
```

### Пример: bindResults
```yaml
name: bindResultsSample
bindResults:
  total: "count + 1"
run:
  - blank:
```

### Пример: repeat
```yaml
name: repeatSample
repeat: 3
run:
  - blank:
```

### Пример: while
```yaml
name: whileSample
while: "attempts < 3"
run:
  - blank:
```

### Пример: if
```yaml
name: ifSample
if: "isEnabled"
run:
  - blank:
```

### Пример: errorIf
```yaml
name: errorIfSample
errorIf: "status !== 'ok'"
run:
  - blank:
```

### Пример: errorIfResult
```yaml
name: errorIfResultSample
errorIfResult: "total <= 0"
run:
  - blank:
```

### Пример: tags
```yaml
name: tagsSample
tags: [smoke, critical]
run:
  - blank:
```

### Пример: inlineJS
```yaml
name: inlineJsSample
inlineJS: |
  return { ok: true };
```

### Пример: breakParentIfResult
```yaml
name: breakParentIfResultSample
breakParentIfResult: "found === true"
run:
  - blank:
```

### Пример: beforeRun
```yaml
name: lifecycleSample
beforeRun:
  - blank:
run:
  - blank:
```

### Пример: run
```yaml
name: runSample
run:
  - blank:
```

### Пример: afterRun
```yaml
name: afterRunSample
afterRun:
  - blank:
```

### Пример: argsRedefine
```yaml
name: argsRedefineSample
argsRedefine:
  PPD_LOG_TIMER_SHOW: false
run:
  - blank:
```

### Пример: continueOnError
```yaml
name: continueOnErrorSample
continueOnError: true
run:
  - blank:
```

### Пример: debug
```yaml
name: debugSample
debug: true
run:
  - blank:
```

### Пример: descriptionError
```yaml
name: descriptionErrorSample
descriptionError: "'Ошибка: ' + message"
run:
  - blank:
```

### Пример: engineSupports
```yaml
name: engineSupportsSample
engineSupports: [playwright]
run:
  - blank:
```

### Пример: frame
```yaml
name: frameSample
frame: "iframe#content"
run:
  - blank:
```

### Пример: logOptions
```yaml
name: logOptionsSample
logOptions:
  logThis: true
run:
  - blank:
```

### Пример: logOptions.logThis
```yaml
name: logOptionsLogThisSample
logOptions:
  logThis: false
run:
  - blank:
```

### Пример: logOptions.logChildren
```yaml
name: logOptionsLogChildrenSample
logOptions:
  logChildren: false
run:
  - blank:
```

### Пример: logOptions.logShowFlag
```yaml
name: logOptionsLogShowFlagSample
logOptions:
  logShowFlag: true
run:
  - blank:
```

### Пример: logOptions.screenshot
```yaml
name: logOptionsScreenshotSample
needSelectors: [title]
logOptions:
  screenshot: true
run:
  - blank:
```

### Пример: logOptions.fullpage
```yaml
name: logOptionsFullpageSample
logOptions:
  fullpage: true
run:
  - blank:
```

### Пример: logOptions.screenshotName
```yaml
name: logOptionsScreenshotNameSample
logOptions:
  screenshotName: "title.png"
run:
  - blank:
```

### Пример: logOptions.fullpageName
```yaml
name: logOptionsFullpageNameSample
logOptions:
  fullpageName: "page.png"
run:
  - blank:
```

### Пример: logOptions.level
```yaml
name: logOptionsLevelSample
logOptions:
  level: warn
run:
  - blank:
```

### Пример: logOptions.textColor
```yaml
name: logOptionsTextColorSample
logOptions:
  textColor: cyan
run:
  - blank:
```

### Пример: logOptions.backgroundColor
```yaml
name: logOptionsBackgroundColorSample
logOptions:
  backgroundColor: black
run:
  - blank:
```

### Пример: options
```yaml
name: optionsSample
options:
  timeout: 5000
run:
  - blank:
```

### Пример: allowOptions
```yaml
name: allowOptionsSample
allowOptions: [timeout]
run:
  - blank:
```

### Пример: skipSublingIfResult
```yaml
name: skipSublingIfResultSample
skipSublingIfResult: "status === 'skip'"
run:
  - blank:
```

### Пример: runnersExt
```yaml
name: runnersExtSample
type: runner
runnersExt: [ciRunner]
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
```

### Пример: browser
```yaml
name: browserSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
```

### Пример: browser.type
```yaml
name: browserTypeSample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
```

### Пример: browser.engine
```yaml
name: browserEngineSample
type: runner
browser:
  type: browser
  engine: puppeteer
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
```

### Пример: browser.browserName
```yaml
name: browserNameSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: firefox
  runtime: run
  headless: true
  slowMo: 0
```

### Пример: browser.runtime
```yaml
name: browserRuntimeSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: connect
  headless: true
  slowMo: 0
```

### Пример: browser.executablePath
```yaml
name: browserExecutablePathSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  executablePath: "C:/Browsers/chrome.exe"
  headless: true
  slowMo: 0
```

### Пример: browser.headless
```yaml
name: browserHeadlessSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: false
  slowMo: 0
```

### Пример: browser.slowMo
```yaml
name: browserSlowMoSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 150
```

### Пример: browser.args
```yaml
name: browserArgsSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  args: ["--disable-gpu"]
```

### Пример: browser.urlDevtoolsJson
```yaml
name: browserUrlDevtoolsSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: connect
  urlDevtoolsJson: "http://localhost:9222/json/version"
  headless: true
  slowMo: 0
```

### Пример: browser.windowSize
```yaml
name: browserWindowSizeSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  windowSize:
    width: 1280
    height: 720
```

### Пример: browser.windowSize.width
```yaml
name: browserWindowWidthSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  windowSize:
    width: 1024
```

### Пример: browser.windowSize.height
```yaml
name: browserWindowHeightSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  windowSize:
    height: 768
```

### Пример: browser.killOnEnd
```yaml
name: browserKillOnEndSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  killOnEnd: true
```

### Пример: browser.killProcessName
```yaml
name: browserKillProcessNameSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  killProcessName: "chrome.exe"
```

### Пример: browser.runtimeEnv
```yaml
name: browserRuntimeEnvSample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  runtimeEnv:
    runtimeExecutable: "C:/Program Files/nodejs/node.exe"
    program: "C:/apps/app.js"
```

### Пример: browser.runtimeEnv.runtimeExecutable
```yaml
name: browserRuntimeExecutableSample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  runtimeEnv:
    runtimeExecutable: "C:/Program Files/nodejs/node.exe"
```

### Пример: browser.runtimeEnv.program
```yaml
name: browserRuntimeProgramSample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  runtimeEnv:
    program: "C:/apps/app.js"
```

### Пример: browser.runtimeEnv.cwd
```yaml
name: browserRuntimeCwdSample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  runtimeEnv:
    cwd: "C:/apps"
```

### Пример: browser.runtimeEnv.args
```yaml
name: browserRuntimeArgsSample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  runtimeEnv:
    args: ["--dev"]
```

### Пример: browser.runtimeEnv.env
```yaml
name: browserRuntimeEnvVarsSample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  runtimeEnv:
    env:
      NODE_ENV: "test"
```

### Пример: browser.runtimeEnv.secondsToStartApp
```yaml
name: browserRuntimeStartDelaySample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  runtimeEnv:
    secondsToStartApp: 5
```

### Пример: browser.runtimeEnv.secondsDelayAfterStartApp
```yaml
name: browserRuntimeAfterDelaySample
type: runner
browser:
  type: electron
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  runtimeEnv:
    secondsDelayAfterStartApp: 2
```

### Пример: browser.timeout
```yaml
name: browserTimeoutSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
  timeout: 60000
```

### Пример: log
```yaml
name: runnerLogSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
log:
  level: info
```

### Пример: log.level
```yaml
name: runnerLogLevelSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
log:
  level: warn
```

### Пример: log.screenshot
```yaml
name: runnerLogScreenshotSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
log:
  screenshot: true
```

### Пример: log.fullpage
```yaml
name: runnerLogFullpageSample
type: runner
browser:
  type: browser
  engine: playwright
  browserName: chromium
  runtime: run
  headless: true
  slowMo: 0
log:
  fullpage: true
```

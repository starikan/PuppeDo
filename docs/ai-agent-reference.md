# PuppeDo: Справочник для AI-агентов

## Структура файлов

**Расширения:** `.yaml`, `.yml`, `.ppd`, `.json`

**Обязательное поле:** `name` — уникальный идентификатор

## Типы агентов

| type | Назначение |
|------|------------|
| `test` | Тестовый сценарий (по умолчанию) |
| `atom` | Переиспользуемое действие |
| `runner` | Конфигурация браузера |
| `data` | Хранилище данных |
| `selectors` | Хранилище селекторов |

## Минимальный тест

```yaml
name: uniqueTestName
run:
  - goTo:
      data: { url: "https://example.com" }
```

## Минимальный атом

```yaml
name: uniqueAtomName
type: atom
run:
  - clickSelector:
      selectors: { selector: buttonSelector }
```

## Жизненный цикл

Порядок выполнения: `beforeRun` → `run` → `afterRun`

```yaml
name: example
beforeRun:
  - # подготовка
run:
  - # основные шаги
afterRun:
  - # очистка
```

## Данные и селекторы

### Inline (в шаге)

```yaml
- typeInput:
    data:
      text: "value"
    selectors:
      selector: "#input"
```

### Внешние файлы

**Файл данных:**
```yaml
name: myData
type: data
data:
  key: "value"
```

**Файл селекторов:**
```yaml
name: mySelectors
type: selectors
data:
  buttonSelector: "#btn"
  form:
    input: "#input"
```

**Подключение:**
```yaml
name: myTest
dataExt:
  - myData
selectorsExt:
  - mySelectors
run:
  - typeInput:
      data: { text: key }                    # key из myData
      selectors: { selector: form.input }    # вложенный селектор через точку
```

## Приоритет слияния данных

От низшего к высшему:
1. `PPD_DATA` (конфиг)
2. `Runner.data`
3. `dataExt`
4. `dataParent` (от родителя)
5. `resultsFromPrevSibling` (результаты предыдущего шага)
6. `data` (inline)
7. `bindData` (вычисляемые)

**Правило:** Более поздний источник переопределяет предыдущий.

## Вычисляемые значения (bind*)

### bindData — динамические данные

```yaml
bindData:
  fullUrl: "baseUrl + '/login'"
  nextPage: "currentPage + 1"
  greeting: "isAdmin ? 'Admin' : 'User'"
```

### bindSelectors — динамические селекторы

```yaml
data:
  index: 3
bindSelectors:
  row: "'tr:nth-child(' + index + ')'"
```

### result / bindResults — сохранение результатов

```yaml
- getText:
    selectors: { selector: header }
    result:
      headerText: text    # сохранить результат атома

- blank:
    data: { a: 10, b: 5 }
    result:
      sum: "a + b"        # вычислить значение
```

### allowResults — разрешение подъёма результатов

```yaml
name: myAtom
type: atom
allowResults:
  - status
  - message
```

**Правило:** Без `allowResults` результаты не поднимаются к родителю.

## Алиасы

| Полное | Короткое |
|--------|----------|
| `data` | `d` |
| `selectors` | `s` |
| `bindData` | `bD`, `bd` |
| `bindSelectors` | `bS`, `bs` |
| `bindResults` | `r`, `result`, `results` |
| `options` | `o`, `opt` |

## Циклы

### repeat — фиксированное число

```yaml
- blank:
    repeat: 3
    run:
      - doSomething:
```

### while — динамический цикл

```yaml
- blank:
    repeat: 1
    while: "!found && $loop < 10"
    run:
      - search:
          result: { found: result }
```

### Переменные цикла

| Переменная | Направление | Пример (repeat: 3) |
|------------|-------------|-------------------|
| `repeat` | убывает | 3 → 2 → 1 |
| `$loop` | возрастает | 1 → 2 → 3 |

## Условия

### if — выполнить если true

```yaml
- step:
    if: "items.length > 0"
```

### errorIf — ошибка если true (до выполнения)

```yaml
- step:
    errorIf: "status !== 'ok'"
```

### errorIfResult — ошибка если true (после выполнения)

```yaml
- getText:
    result: { text: text }
    errorIfResult: "!text"
```

## Управление потоком

### breakParentIfResult — выход из родительского цикла

```yaml
- search:
    result: { found: result }
    breakParentIfResult: "found"
```

### skipSublingIfResult — пропуск последующих шагов

```yaml
- check:
    skipSublingIfResult: "shouldSkip"
- skippedStep:    # пропустится
```

### disable — отключить шаг

```yaml
- step:
    disable: true
```

## Валидация

### needData — обязательные данные

```yaml
name: myAtom
type: atom
needData:
  - username
  - password
  - timeout?      # опциональный (с ?)
```

### needSelectors — обязательные селекторы

```yaml
name: myAtom
type: atom
needSelectors:
  - submitButton
  - form.input
```

## Кастомный код

### inlineJS

```yaml
- customStep:
    inlineJS: |
      const result = this.data.value * 2;
      return { computed: result };
```

**Доступные объекты в inlineJS:**
- `this.data` — данные
- `this.selectors` — селекторы
- `this.page` — объект страницы (Playwright/Puppeteer)
- `this.options` — опции

## Атом с TypeScript

**Структура:**
```
atoms/
  └── myAtom/
      ├── myAtom.yaml
      └── myAtom.ts
```

**myAtom.yaml:**
```yaml
name: myAtom
type: atom
needData:
  - inputValue
allowResults:
  - outputValue
```

**myAtom.ts:**
```typescript
import type { AtomRun } from 'puppedo';

// Вариант 1: Функция с export default
export default async function atomRun() {
  return {
    outputValue: this.data.inputValue * 2
  };
};

// Вариант 2: Переменная с типизацией
const atomRun: AtomRun = async function() {
  return {
    outputValue: this.data.inputValue * 2
  };
};

export default atomRun;
```

## Runner

```yaml
name: mainRunner
type: runner
browser:
  engine: playwright          # playwright | puppeteer
  browserName: chromium       # chromium | firefox | webkit
  headless: false
  windowSize:
    width: 1920
    height: 1080
```

**Запуск браузера:**
```yaml
- runnerSwitch:
    data: { runnerName: mainRunner }
```

**Закрытие:**
```yaml
- runnerClose:
    data: { runnerName: mainRunner }
```

## Встроенные атомы

| Атом | Назначение |
|------|------------|
| `blank` | Контейнер для lifecycle/inlineJS |
| `goTo` | Переход по URL |
| `runnerSwitch` | Запуск браузера |
| `runnerClose` | Закрытие браузера |
| `clickSelector` | Клик |
| `typeInput` | Ввод текста |
| `getText` | Получить текст |
| `getValue` | Получить value |
| `setValue` | Установить value |
| `waitForSelector` | Ждать появления |
| `waitForSelectorHidden` | Ждать скрытия |
| `hover` | Наведение |
| `focus` | Фокус |
| `scrollTo` | Прокрутка |
| `pressKey` | Нажатие клавиши |
| `selectOption` | Выбор в select |
| `checkCheckbox` | Чекбокс |
| `getAttribute` | Получить атрибут |
| `evaluateExpression` | JS на странице |

## Логирование

```yaml
- step:
    logOptions:
      logThis: true
      logChildren: true
      screenshot: true
      fullpage: false
      textColor: green
```

## Плагины

| Плагин | Назначение |
|--------|------------|
| `continueOnError: true` | Продолжить при ошибке |
| `debug: true` | Пауза для отладки |
| `descriptionError: "msg"` | Кастомное сообщение ошибки |
| `engineSupports: [playwright]` | Ограничение по движку |
| `frame: "iframe#id"` | Работа с iframe |

## Контекст выражений

Доступны в `bindData`, `bindSelectors`, `result`, `if`, `while`, `errorIf`, `errorIfResult`:

- Все ключи из `data`
- Все ключи из `selectors`
- Результаты предыдущих шагов
- `repeat` — счётчик (убывает)
- `$loop` — номер итерации (возрастает)
- `stepId` — ID шага

## Критические правила

1. **Имена уникальны** — дубли вызывают ошибку
2. **Data + Selectors = единый контекст** — конфликт ключей = ошибка
3. **Результаты локальны** — без `allowResults` не поднимаются к родителю
4. **needData без `?`** — обязательный параметр
5. **Выражения** — валидный JavaScript, ошибка синтаксиса = ошибка выполнения
6. **$loop начинается с 1** — не с 0
7. **repeat начинается с N** — убывает до 1

## Шаблон теста с браузером

```yaml
name: testWithBrowser
type: test

beforeRun:
  - runnerSwitch:
      data: { runnerName: mainRunner }
  - goTo:
      data: { url: "https://example.com" }

run:
  - typeInput:
      selectors: { selector: "#username" }
      data: { text: "user" }
  - clickSelector:
      selectors: { selector: "#submit" }
  - waitForSelector:
      selectors: { selector: ".dashboard" }

afterRun:
  - runnerClose:
      data: { runnerName: mainRunner }
```

## Шаблон атома

```yaml
name: loginUser
type: atom
description: Авторизация пользователя

needData:
  - username
  - password
needSelectors:
  - usernameInput
  - passwordInput
  - submitButton

allowResults:
  - success

run:
  - typeInput:
      selectors: { selector: usernameInput }
      data: { text: username }
  - typeInput:
      selectors: { selector: passwordInput }
      data: { text: password }
  - clickSelector:
      selectors: { selector: submitButton }
  - blank:
      result:
        success: "true"
```

## Шаблон цикла с выходом

```yaml
- blank:
    repeat: 10
    run:
      - searchItem:
          result: { found: result }
          breakParentIfResult: "found"
      - clickSelector:
          selectors: { selector: nextPage }
```

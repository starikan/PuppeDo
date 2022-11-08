# Runner file

File with runner information. There is may more then one runner in test. You can switch between runners.

If there exist more then one runner with the same name they merge. Use in for development redefinition parts of runner in private runner file. I.e. for start electron app from your local files.

```yaml
name: mainEnv
type: env
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

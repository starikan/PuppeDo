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
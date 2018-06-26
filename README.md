# PuppeDo
Puppeteer tests flow with node.js

Imstall NodeJS v10.4.0

```
npm install
```

Create files in folder 'json' base on examples jsons.

```
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run",
      "program": "${workspaceFolder}\\index.js",
      "args": [
        "--envs=[\"./json/envCloud.json\", \"./json/envElectron.json\", \"./json/envApi.json\"]",
        "--test=test",
        "--output=output",
      ]
    }
  ]
```


envCloud.json
```
{
  "name": "cloud",
  "data": {
    "baseUrl": "${}",
    "urls": {},
    "auth": {
      "login": "${}",
      "password": "${}"
    }
  },
  "selectors": {
    "auth": {
      "inputLogin": "#username",
      "inputPassword": "#password",
      "inputSubmit": "button[type='submit']"
    }
  },
  "browser": {
    "type": "puppeteer",
    "runtime": "run",
    "args": [
      "--window-size=1024, 918"
    ],
    "headless": false,
    "slowMo": 10,
    "windowSize": {
      "width": 1024,
      "height": 768
    }
  },
  "logLevel": "debug",
  "screenshots": {
    "isScreenshot": true,
    "fullPage": true
  }
}
```

envElectron.json
```
{
  "name": "electron",
  "data": {
    "baseUrl": "${}",
    "urls": {},
    "auth": {
      "login": "${}",
      "password": "${}"
    }
  },
  "selectors": {
    "auth": {
      "inputLogin": "#username",
      "inputPassword": "#password",
      "inputSubmit": "button[type='submit']"
    }
  },
  "browser": {
    "type": "puppeteer",
    "runtime": "connect"
  },
  "headless": false,
  "slowMo": 100,
  "logLevel": "debug"
}
```

envApi.json
```
{
  "name": "api",
  "data": {
    "baseUrl": "${}",
    "urls": {},
    "auth": {
      "login": "${}",
      "password": "${}"
    }
  },
  "selectors": {},
  "browser": {
    "type": "api"
  },
  "logLevel": "debug"
}
```
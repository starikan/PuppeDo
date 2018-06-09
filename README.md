# PuppeDo
Puppeteer tests flow with node.js

```
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run",
      "program": "${workspaceFolder}\\index.js",
      "args": [
        "--env json/env.json",
        "--selectors json/selectors.json",
      ]
    }
  ]
```
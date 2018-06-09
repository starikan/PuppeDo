# PuppeDo
Puppeteer tests flow with node.js

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
        "--env ./json/env.json",
        "--selectors ./json/selectors.json",
      ]
    }
  ]
```
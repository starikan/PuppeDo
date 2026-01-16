const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Building SEA bundle...');
  execSync('npm run build-sea', { stdio: 'inherit' });

  console.log('Creating sea-config.json...');
  const seaConfig = {
    main: 'dist/sea.bundle.js',
    output: 'sea-prep.blob'
  };
  fs.writeFileSync('sea-config.json', JSON.stringify(seaConfig, null, 2));

  console.log('Generating SEA blob...');
  execSync('node --experimental-sea-config sea-config.json', { stdio: 'inherit' });

  console.log('Copying Node.js binary...');
  const portableDir = path.join(process.cwd(), 'portable-node');
  const portableNodePath = path.join(portableDir, 'node.exe');
  if (!fs.existsSync(portableNodePath)) {
    console.log('Downloading portable Node.js...');
    const psCommand = `powershell -command "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.17.0/node-v20.17.0-win-x64.zip -OutFile node.zip; Expand-Archive node.zip -DestinationPath temp; Move-Item temp/node-v20.17.0-win-x64/* '${portableDir.replace(/\\/g, '/')}'; Remove-Item temp; Remove-Item node.zip"`;
    execSync(psCommand, { stdio: 'inherit' });
  }
  const nodePath = fs.existsSync(portableNodePath) ? portableNodePath : process.execPath;
  const exePath = path.join(process.cwd(), 'dist', 'puppedo.exe');
  if (!fs.existsSync(path.dirname(exePath))) {
    fs.mkdirSync(path.dirname(exePath), { recursive: true });
  }
  fs.copyFileSync(nodePath, exePath);

  console.log('Injecting blob into executable...');
  execSync(`npx postject "${exePath}" NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --overwrite`, { stdio: 'inherit' });

  console.log('SEA executable created: dist/puppedo.exe');
} catch (error) {
  console.error('Error during SEA generation:', error.message);
  process.exit(1);
}
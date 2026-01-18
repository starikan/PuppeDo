import fs from 'fs';
import path from 'path';
import Screenshot from '../src/Screenshot';
import { Environment } from '../src/Environment';
import { getNowDateTime } from '../src/Helpers';

jest.mock('../src/Environment');
jest.mock('../src/Helpers');

const mockEnvironmentClass = Environment as jest.MockedClass<typeof Environment>;
const mockGetNowDateTime = getNowDateTime as jest.MockedFunction<typeof getNowDateTime>;

const tempRoot = path.join('.temp', 'screenshots');
const folder = path.join(tempRoot, 'main');
const folderLatest = path.join(tempRoot, 'latest');

const ensureDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const clearDir = (dir: string): void => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => fs.unlinkSync(path.join(dir, file)));
  }
};

describe('Screenshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureDir(folder);
    ensureDir(folderLatest);
    clearDir(folder);
    clearDir(folderLatest);

    mockGetNowDateTime.mockReturnValue('2025-01-01_00-00-00.000');

    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getOutput: jest.fn().mockReturnValue({ folder, folderLatest }),
          getEnvRunners: jest.fn().mockReturnValue({
            getActivePage: jest.fn().mockReturnValue({
              screenshot: jest.fn().mockImplementation(({ path: outPath }) => {
                fs.writeFileSync(outPath, 'page');
              }),
            }),
          }),
        } as any),
    );
  });

  test('copyScreenshotToFolder copies file when exists', async () => {
    const src = path.join(tempRoot, 'source.png');
    fs.writeFileSync(src, 'image');

    await Screenshot.copyScreenshotToFolder(src, folderLatest, 'copy');

    expect(fs.existsSync(path.join(folderLatest, 'copy.png'))).toBe(true);
  });

  test('copyScreenshotToFolder creates folder when missing', async () => {
    const tempFolder = path.join(tempRoot, 'missing');
    if (fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, { recursive: true, force: true });
    }

    const src = path.join(tempRoot, 'source-2.png');
    fs.writeFileSync(src, 'image');

    await Screenshot.copyScreenshotToFolder(src, tempFolder, 'copy2');

    expect(fs.existsSync(path.join(tempFolder, 'copy2.png'))).toBe(true);
  });

  test('copyScreenshotToFolder does nothing if source missing', async () => {
    const missing = path.join(tempRoot, 'missing.png');

    await Screenshot.copyScreenshotToFolder(missing, folderLatest, 'copy');

    expect(fs.existsSync(path.join(folderLatest, 'copy.png'))).toBe(false);
  });

  test('copyScreenshotToFolder creates folder even if source missing', async () => {
    const tempFolder = path.join(tempRoot, 'missing-2');
    if (fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, { recursive: true, force: true });
    }

    const missing = path.join(tempRoot, 'missing-2.png');
    await Screenshot.copyScreenshotToFolder(missing, tempFolder, 'copy');

    expect(fs.existsSync(tempFolder)).toBe(true);
    expect(fs.existsSync(path.join(tempFolder, 'copy.png'))).toBe(false);
  });

  test('getScreenshotName uses output folder', () => {
    const screenshot = new Screenshot('env-1');
    const name = screenshot.getScreenshotName('custom');

    expect(name).toContain(path.join(folder, 'custom.png'));
  });

  test('getScreenshotName uses default folder and timestamp', () => {
    mockEnvironmentClass.mockImplementationOnce(
      () =>
        ({
          getOutput: jest.fn().mockReturnValue({}),
        } as any),
    );
    mockGetNowDateTime.mockReturnValue('2025-01-02_00-00-00.000');

    const screenshot = new Screenshot('env-1');
    const name = screenshot.getScreenshotName();

    expect(path.basename(name)).toBe('2025-01-02_00-00-00.000.png');
  });

  test('copyScreenshotToLatest uses latest folder', async () => {
    const src = path.join(tempRoot, 'latest-source.png');
    fs.writeFileSync(src, 'image');

    const screenshot = new Screenshot('env-1');
    await screenshot.copyScreenshotToLatest(src);

    expect(fs.existsSync(path.join(folderLatest, 'latest-source.png'))).toBe(true);
  });

  test('copyScreenshotToLatest uses default folder when missing', async () => {
    mockEnvironmentClass.mockImplementationOnce(
      () =>
        ({
          getOutput: jest.fn().mockReturnValue({}),
        } as any),
    );

    const src = path.join(tempRoot, 'latest-default.png');
    fs.writeFileSync(src, 'image');

    const screenshot = new Screenshot('env-1');
    await screenshot.copyScreenshotToLatest(src);

    const target = path.resolve('.', path.basename(src));
    expect(fs.existsSync(target)).toBe(true);
    fs.unlinkSync(target);
  });

  test('saveScreenshotElement saves and copies to latest', async () => {
    const element = {
      screenshot: jest.fn().mockImplementation(({ path: outPath }) => {
        fs.writeFileSync(outPath, 'element');
      }),
    };

    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotElement(element as any, 'element');

    expect(pathSaved).toContain(path.join(folder, 'element.png'));
    expect(fs.existsSync(pathSaved)).toBe(true);
    expect(fs.existsSync(path.join(folderLatest, 'element.png'))).toBe(true);
  });

  test('saveScreenshotElement skips copy when disabled', async () => {
    const element = {
      screenshot: jest.fn().mockImplementation(({ path: outPath }) => {
        fs.writeFileSync(outPath, 'element');
      }),
    };

    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotElement(element as any, 'element-nocopy', false);

    expect(pathSaved).toContain(path.join(folder, 'element-nocopy.png'));
    expect(fs.existsSync(path.join(folderLatest, 'element-nocopy.png'))).toBe(false);
  });

  test('saveScreenshotElement returns empty when element missing', async () => {
    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotElement(null as any, 'empty');

    expect(pathSaved).toBe('');
  });

  test('saveScreenshotElement returns empty on error', async () => {
    const element = {
      screenshot: jest.fn().mockRejectedValue(new Error('fail')),
    };

    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotElement(element as any, 'element');

    expect(pathSaved).toBe('');
  });

  test('saveScreenshotFull saves page screenshot', async () => {
    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotFull('full', false);

    expect(pathSaved).toContain(path.join(folder, 'full_full.png'));
    expect(fs.existsSync(pathSaved)).toBe(true);
  });

  test('saveScreenshotFull uses default name when missing', async () => {
    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotFull(undefined, false);

    expect(path.basename(pathSaved)).toBe('2025-01-01_00-00-00.000_full.png.png');
  });

  test('saveScreenshotFull copies to latest by default', async () => {
    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotFull('full-copy');

    expect(pathSaved).toContain(path.join(folder, 'full-copy_full.png'));
    expect(fs.existsSync(path.join(folderLatest, 'full-copy_full.png.png'))).toBe(true);
  });

  test('saveScreenshotFull returns empty on error', async () => {
    mockEnvironmentClass.mockImplementation(
      () =>
        ({
          getOutput: jest.fn().mockReturnValue({ folder, folderLatest }),
          getEnvRunners: jest.fn().mockImplementation(() => {
            throw new Error('no page');
          }),
        } as any),
    );

    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotFull('full');

    expect(pathSaved).toBe('');
  });

  test('saveScreenshotFull returns empty when page is null', async () => {
    const envMock = () =>
      ({
        getOutput: jest.fn().mockReturnValue({ folder, folderLatest }),
        getEnvRunners: jest.fn().mockReturnValue({
          getActivePage: jest.fn().mockReturnValue(null),
        }),
      } as any);

    mockEnvironmentClass.mockImplementationOnce(envMock).mockImplementationOnce(envMock);

    const screenshot = new Screenshot('env-1');
    const pathSaved = await screenshot.saveScreenshotFull('full-null', false);

    expect(pathSaved).toBe('');
  });

  test('getScreenshotsLogEntry returns both screenshots', async () => {
    const element = {
      screenshot: jest.fn().mockImplementation(({ path: outPath }) => {
        fs.writeFileSync(outPath, 'element');
      }),
    };

    const screenshot = new Screenshot('env-1');
    const result = await screenshot.getScreenshotsLogEntry(true, true, element as any, 'full', 'element');

    expect(result.length).toBe(2);
    expect(result.some((v) => v.includes('full_full.png'))).toBe(true);
    expect(result.some((v) => v.includes('element.png'))).toBe(true);
  });

  test('getScreenshotsLogEntry returns empty when disabled', async () => {
    const screenshot = new Screenshot('env-1');
    const result = await screenshot.getScreenshotsLogEntry(false, false, null as any);

    expect(result).toEqual([]);
  });
});

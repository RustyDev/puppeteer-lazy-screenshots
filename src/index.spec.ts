import {
  takeScreenshot,
  setViewport,
  navigateToUrl,
  pressEscapeKey,
  scrollPage,
  saveScreenshot,
} from '.';
import PuppeteerAutoScrollDown from 'puppeteer-autoscroll-down';
import 'expect-puppeteer';

const url = 'https://google.com';

jest.spyOn(page.keyboard, 'press').getMockImplementation();
jest.spyOn(page, 'screenshot').getMockImplementation();
jest
  .spyOn(PuppeteerAutoScrollDown, 'scrollPageToBottom')
  .getMockImplementation();

beforeEach(async () => {
  await page.goto(url);
});

afterAll((done) => {
  page.close();
  jest.resetAllMocks();
  done();
});

describe('setViewport', () => {
  it('should call page.setViewport with the provided width and height', async () => {
    const viewport = [1280, 900];
    await setViewport(page, viewport);
    const dimensions = await page.viewport();
    expect(dimensions).toEqual({ width: 1280, height: 900 });
  });
});

describe('pressEscapeKey', () => {
  it('should call page.keyboard.press with the "Escape" key', async () => {
    await pressEscapeKey(page);
    expect(page.keyboard.press).toHaveBeenCalledWith('Escape');
  });
});

describe('scrollPage', () => {
  it('should call scrollPageToBottom and scrollPageToTop with the proper parameters', async () => {
    const viewport = [1400, 800];
    const delay = 375;
    const disableScrolling = false;

    await scrollPage(page, viewport, delay, disableScrolling);

    expect(PuppeteerAutoScrollDown.scrollPageToBottom).toHaveBeenCalledWith(
      page,
      {
        size: viewport[1],
        delay,
      }
    );
  });
});

describe('saveScreenshot', () => {
  it('should call page.screenshot with the proper parameters', async () => {
    const dir = 'screenshots';
    const extension = 'jpg';
    const fullPage = true;

    await saveScreenshot(page, dir, url, extension, fullPage);

    const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '_');
    const screenshotPath = `${dir}/${domain}.${extension}`;
    const expectedParams = {
      path: screenshotPath,
      fullPage,
    };

    expect(page.screenshot).toHaveBeenCalledWith(expectedParams);
  });
});

describe('saveScreenshot with quality', () => {
  it('should call page.screenshot with the proper parameters including quality', async () => {
    const dir = 'screenshots';
    const extension = 'jpg';
    const fullPage = true;
    const quality = 80;

    await saveScreenshot(page, dir, url, extension, fullPage, quality);

    const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '_');
    const screenshotPath = `${dir}/${domain}.${extension}`;
    const expectedParams = {
      path: screenshotPath,
      fullPage,
      quality,
    };

    expect(page.screenshot).toHaveBeenCalledWith(expectedParams);
  });
});

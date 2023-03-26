import fs from 'fs';
import minimist from 'minimist';
import path from 'path';
import * as puppeteer from 'puppeteer';
import { scrollPageToBottom } from 'puppeteer-autoscroll-down';
import * as progress from 'cli-progress';

interface Args {
  d?: number;
  e?: AllowedExtensions;
  h?: boolean;
  o?: string;
  q?: number;
  s?: boolean;
  vh?: number;
  vw?: number;
}

type AllowedExtensions = 'jpg' | 'png' | 'jpeg' | 'webp';

const argv: Args = minimist(process.argv.slice(2));

const width: number = argv.vw ?? 1400;
const height: number = argv.vh ?? 800;
const headless: boolean = argv.h ? false : true;
const viewport = [width, height];
const disableScrolling: boolean = argv.s ?? false;
const dir: string = argv.o ?? 'screenshots';
const delay: number = argv.d ?? 375;
const extension: AllowedExtensions = argv.e ?? 'png';
const quality: number = argv.q;

const urls: string[] = fs
  .readFileSync('urls.txt', { encoding: 'utf-8' })
  .split('\n')
  .filter((url: string) => url.trim() !== '');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const totalScreenshots = urls.length;

const progressBar = new progress.SingleBar(
  {
    format: '{bar} {percentage}% | {value}/{total} | {url}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: false,
  },
  progress.Presets.shades_classic
);

export async function takeScreenshot(
  page: any,
  url: string,
  dir: string,
  disableScrolling: boolean,
  viewport: number[],
  delay: number,
  extension: AllowedExtensions
) {
  await setViewport(page, viewport);
  await navigateToUrl(page, url);
  await pressEscapeKey(page);
  await scrollPage(page, viewport, delay, disableScrolling);
  await saveScreenshot(page, dir, url, extension, !disableScrolling, quality);
}

export async function setViewport(page: any, viewport: number[]) {
  await page.setViewport({
    width: viewport[0],
    height: viewport[1],
  });
}

export async function navigateToUrl(page: any, url: string) {
  await page.goto(url, {
    waitUntil: 'networkidle0',
  });
}

export async function pressEscapeKey(page: any) {
  await page.keyboard.press('Escape');
}

export async function scrollPage(
  page: any,
  viewport: number[],
  delay: number,
  disableScrolling: boolean
) {
  if (!disableScrolling) {
    await scrollPageToBottom(page, {
      size: viewport[1],
      delay,
    });
    await page.waitForTimeout(1000);
    // scroll to top to capture fixed navs
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);
  }
}

export async function saveScreenshot(
  page: any,
  dir: string,
  url: string,
  extension: AllowedExtensions,
  fullPage: boolean,
  quality: number = null
) {
  const domain: string = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '_');
  const screenshotPath: string = path.join(dir, `${domain}.${extension}`);

  await page.screenshot({
    path: screenshotPath,
    fullPage,
    ...(quality ? { quality } : {}),
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless,
  });

  try {
    progressBar.start(totalScreenshots, 0);

    for (let i = 0; i < totalScreenshots; i++) {
      const url = urls[i];

      const page = await browser.newPage();
      progressBar.update(i + 1, { url });

      let urlWithProtocol = url;

      if (!urlWithProtocol.match(/^[a-zA-Z]+:\/\//)) {
        urlWithProtocol = `https://${urlWithProtocol}`;
      }

      await takeScreenshot(
        page,
        urlWithProtocol,
        dir,
        disableScrolling,
        viewport,
        delay,
        extension
      );

      await page.close();
    }
    progressBar.stop();
    console.log(`Done! Saved ${totalScreenshots} screenshots to ${dir}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

# Puppeteer Bulk Screenshots w/ Lazy Loading

This Node.js application captures screenshots of a list of URLs and saves them to a specified directory. It can take full-page screenshots or screenshots of a single viewport, and uses the `puppeteer` and `puppeteer-autoscroll-down` libraries to automate the process. This ensures that the screenshots accurately capture all the content, even when it is loaded lazily.

## Installation

To install the dependencies, run the following command in the terminal:

```bash
npm install
```

## Usage

To use the script, edit `urls.txt` by adding the URLs you want to take screenshots of, one URL per line. If you leave off the protocol, `https://` will be added.

```bash
https://www.nytimes.com
google.com
```

Then run the following command in the terminal:

```bash
npm run start [options]
```

where `[options]` are the command line options you can pass to the script:

- `-w <width>`: set the viewport width (default: 1400)
- `-h <height>`: set the viewport width (default: 800)
- `-s <single>`: disable scrolling to take a full-page screenshot (default: false)
- `-o <directory>`: set the output directory for the screenshots (default: "screenshots")
- `-d <delay>`: set the delay between each scroll event in milliseconds to trigger lazy loaded content (default: 375)
- `-e <extension>`: set the file extension for the screenshots - `jpg` | `png` | `jpeg` (default: "png")
- `-q <quality>`: set the quality for the screenshots - 1 to 100 (default:blank)

For example, to take screenshots of the URLs listed in `urls.txt` with a viewport size of 800x600 and output them to a directory called `screens`, run the following command:

```bash
npm run start -w 800 -h 600 -o screens
```

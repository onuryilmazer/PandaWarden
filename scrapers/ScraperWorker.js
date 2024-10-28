import { chromium } from "playwright";
import DWScraper from "./sources/DWScraper.js";

let browser;
let context;
let initialized = false;

async function initialize() {
    browser = await chromium.launch({headless: false});
    context = await browser.newContext();
    initialized = true;
}

async function scrape(source) {
    if (!initialized) await initialize();

    let articles = [];

    if (source === "DW") {
        const dwScraper = new DWScraper(context);
        articles = await dwScraper.scrape();
    }

    process.send(articles);
}

async function close() {
    await context.close();
    await browser.close();
}

process.on("message", (message) => {
    scrape(message);
});
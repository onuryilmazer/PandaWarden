import "./utils/config.js";
import { scrapers } from "./sources/index.js";
import { chromium } from "playwright";

class ScraperWorker {
    browser;
    context;
    initialized = false;

    /**
     * Launches the browser instance for this ScraperWorker and creates a new context
     */
    async initialize() {
        if (this.initialized) return;

        this.browser = await chromium.launch({headless: process.env.HEADLESS === "false" ? false : true});
        this.context = await this.browser.newContext();
        this.initialized = true;
    }
    
    /**
     * Starts scraping content for the given source, initializing the scraper if it hasn't been initialized yet.
     * @param {string} source The source that will be scraped for content
     * @returns {void} The scraping results will be sent as an IPC message to the parent process.
     */
    async scrape(source) {
        if (!this.initialized) await this.initialize();
    
        if (!scrapers.has(source)) {
            process.send({ 
                ok: false,
                error: `Source ${source} is not supported.`,
            });
            return;
        }
        
        const ScraperClass = scrapers.get(source);
        const scraperInstance = new ScraperClass(this.context);
        const scrapingResults = await scraperInstance.scrape();
    
        process.send({
            ok: true,
            data: scrapingResults.articles,
            dataFolder: scrapingResults.screenshotsFolder
        });
    }
    
    /**
     * Closes the BrowserContext and Browser instances of this ScraperWorker, and subsequently terminates the current process.
     */
    async close() {
        await this.context.close();
        await this.browser.close();
        process.exit(0);
    }

    async _saveToDatabase() {
        
    }
}

const scraperWorker = new ScraperWorker();
scraperWorker.initialize();

process.on("message", async message => {
    switch (message.command) {
        case "scrape": 
            await scraperWorker.scrape(message.source);
            break;
        case "close":
            await scraperWorker.close();
            break;
        case "initialize":
            await scraperWorker.initialize();
            break;
    }
});
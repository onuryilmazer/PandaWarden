import "./utils/config.js";
import { scrapers } from "./sources/index.js";
import { chromium } from "playwright";
import { error } from "./utils/logger.js";

class ScraperWorker {
    browser;
    context;
    initialized = false;

    /**
     * Launches the browser instance for this ScraperWorker and creates a new context
     */
    async initialize() {
        if (this.initialized) return;

        this.browser = await chromium.launch({headless: process.env.HEADLESS === "true"});
        this.context = await this.browser.newContext();
        this.initialized = true;
    }
    
    /**
     * Starts scraping content for the given source, initializing the scraper if it hasn't been initialized yet.
     * @param {} details 
     * @returns {void} The scraping results will be sent as an IPC message to the parent process.
     */
    async scrape(details) {
        if (!this.initialized) await this.initialize();
    
        if (!scrapers.has(details.source)) {
            process.send({ 
                ok: false,
                error: `Source ${details.source} is not supported.`,
            });
            return;
        }
        
        const ScraperClass = scrapers.get(details.source);
        const scraperInstance = new ScraperClass(this.context);
        let scrapingResults;
        
        try {
            scrapingResults = await scraperInstance.scrape(details);
            process.send({
                ok: true,
                data: scrapingResults,
            });     
        }
        catch (e) {
            process.send({
                ok: false,
                error: e.message,
            });     
        }        
    }


    handleMessage(message) {
        switch (message.command) {
            case "scrape":
                this.scrape(message.details);
                break;
            case "close":
                this.close();
                break;
        }
    }

    /**
     * Closes the BrowserContext and Browser instances of this ScraperWorker, and subsequently terminates the current process.
     */
    async close() {
        await this.context.close();
        await this.browser.close();
        process.exit(0);
    }
}

const scraperWorker = new ScraperWorker();
scraperWorker.initialize();

process.on("message", (message) => scraperWorker.handleMessage(message));
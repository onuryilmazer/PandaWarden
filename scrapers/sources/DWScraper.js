import Scraper from "./Scraper.js";
import { info, debug, error } from "../utils/logger.js";
import { writeFile, mkdir } from "node:fs/promises";

class DWScraper extends Scraper {
    homepageURL = "https://www.dw.com/";
    _initialized = false;
    articles = [];

    /**
     * 
     * @param {import("playwright").BrowserContext} context The browser context in which a page will be created and the source will be scraped
     */
    constructor(context) {
        super(context);
        this.folderName = `${process.env.DATA_FOLDER}/DW_${Date.now()}`;
    }

    /**
     * 
     * @returns Array of scraped articles
     */
    async scrape() {
        await this._initialize();

        //collect articles by calling scraping methods.
        await this._scrapeTopStorySection();
        await this._scrapeNewsSection();
        await this._scrapeTeasersSections();

        //cleanup
        await this._destroy();

        //return array of scraped images (user can save them into db).
        return {articles: this.articles, screenshotsFolder: this.folderName};
    }

    async _initialize() {
        if (this._initialized) return;

        //create screenshots folder
        await mkdir(this.folderName, {recursive: true});

        //create page & goto homepage
        this.page = await this.context.newPage();
        await this.page.goto(this.homepageURL);
        
        //dismiss cookies
        await this._dismissCookies();
        
        //scroll to bottom to make images load
        await this._scrollToBottom(this.page, true);

        //hide header
        await this._hidePageHeader();
        
        this._initialized = true;
    }
    
    async _dismissCookies() {
        try {
            info("Dismissing cookies...");
        
            const cookieRejectButton = this.page.locator("#cmpwelcomebtnno");
            await cookieRejectButton.waitFor({state: "visible", timeout: 5000});
            await cookieRejectButton.click();
            await cookieRejectButton.waitFor({state: "hidden"});
        
            debug("Cookie consent form is dismissed.");
        }
        catch (e) {
            error("Exception thrown when handling cookie consent form (already dismissed?)");
            debug(e.message);
        }
    }

    async _hidePageHeader() {
        try {
            info("Hiding fixed page header...");

            const header = this.page.locator(".page-header");
            await header.evaluate((header) => header.hidden = true);
        }
        catch (e) {
            error("Exception thrown when trying to hide page header");
            debug(e.message);
        }
    }

    async _scrapeTopStorySection() {
        try {
            info("Scraping top story");
            let topStory = {};
        
            const topStoryContainer = this.page.locator("section.top-story");
            const titleLink = topStoryContainer.locator("h3 a");
            topStory.title = await titleLink.innerText();
            topStory.url = await titleLink.evaluate(link => link.href);
            topStory.time = await topStoryContainer.locator("time").first().innerText();
            
            let imageBuffer = await topStoryContainer.screenshot({type: "jpeg"});
            topStory.screenshotPath = this._generateImagePath(topStory.title, ".jpeg");
            await writeFile(topStory.screenshotPath, imageBuffer);

            this.articles.push(topStory);
        }
        catch (e) {
            error("Exception thrown when scraping the top story");
            debug(e.message);
        }
    }

    async _scrapeNewsSection() {
        try {
            info("Scraping news items");
            const newsItems = this.page.locator("div.news .news-item");
            debug(`Found ${await newsItems.count()} news items`);

            const newsItems_processed = [];
            for(let newsItem of await newsItems.all()) {
                try {
                    let newsItem_processed = {};
                    newsItem_processed.time = await newsItem.locator("time").first().innerText();
                    
                    const link = newsItem.locator(".news-title a");
                    newsItem_processed.title = await link.innerText();
                    newsItem_processed.url = await link.evaluate(link => link.href);
                    newsItems_processed.push(newsItem_processed);

                    const imageBuffer = await newsItem.screenshot({ type: "jpeg" });
                    newsItem_processed.screenshotPath = this._generateImagePath(newsItem_processed.title, ".jpeg");
                    await writeFile(newsItem_processed.screenshotPath, imageBuffer);

                    this.articles.push(newsItem_processed);
                }
                catch (e) {
                    error(`Exception thrown when scraping news item (specific)`);
                    debug(e.message);
                }
            }
        }
        catch (e) {
            error("Exception thrown when scraping news items (general)");
            debug(e.message);
        }
    }

    async _scrapeTeasersSections() {
        try {
            info("Scraping article teasers");
            const teasers = this.page.locator(".teaser");
            debug(`Found ${await teasers.count()} article teasers`);
        
            const teasers_processed = [];
        
            for(let teaser of await teasers.all()) {
                try {
                    const teaser_processed = {};


                    teaser_processed.title = await teaser.locator(".teaser-data a").first().innerText();

                    try { teaser_processed.description = await teaser.locator(".teaser-data .teaser-description").innerText({timeout: 1000}); }
                    catch (e) { console.log("No description for " + teaser_processed.title); }

                    teaser_processed.url = await teaser.locator(".teaser-data a").first().evaluate(link => link.href);

                    try { teaser_processed.time = await teaser.locator("time").first().innerText({timeout: 1000}); }
                    catch (e) { console.log("No time for " + teaser_processed.title); }

                    teasers_processed.push(teaser_processed);
            
                    const imageBuffer = await teaser.screenshot({type: "jpeg"});
                    teaser_processed.screenshotPath = this._generateImagePath(teaser_processed.title, ".jpeg");
                    await writeFile(teaser_processed.screenshotPath, imageBuffer);

                    this.articles.push(teaser_processed);
                }
                catch (e) {
                    error(`Exception thrown when scraping article teaser (specific)`);
                    debug(e.message);
                }
            }
        }
        catch (e) {
            error("Exception thrown when scraping article teasers (general)");
            debug(e.message);
        } 
    }
}


export default DWScraper;
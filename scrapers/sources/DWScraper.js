import Scraper from "./Scraper.js";
import { info, debug, error } from "../utils/logger.js";
import { writeFile, mkdir } from "node:fs/promises";

class DWScraper extends Scraper {
    homepageURL = "https://www.dw.com/";


    /**
     * 
     * @param {import("playwright").BrowserContext} context The browser context in which a page will be created and the source will be scraped
     */
    constructor(context) {
        super(context);
        this.folderName = `${process.env.DATA_FOLDER}/DW`;
    }

    async scrape(details) {
        if (details.target == "homepage") return this.scrapeHomepage();
        else if (details.target == "article") return this.scrapeArticle(details.article);
    }

    /**
     * 
     * @returns Array of scraped articles
     */
    async scrapeHomepage() {
        //create a folder for the screenshots
        await this.createSSFolder();

        //create page & goto homepage
        const page = await this.context.newPage();
        await this._preparePage(page, this.homepageURL);

        //collect articles by calling scraping methods.
        const articles = [];
        articles.push(...await this._scrapeTopStorySection(page));
        articles.push(...await this._scrapeNewsSection(page));
        articles.push(...await this._scrapeTeasersSections(page));

        articles.forEach(article => article.identifierWithinSource = this.determineSourceIdentifier(article));

        //cleanup (no await needed)
        page.close();

        //return array of scraped images (user can save them into db).
        return { articles,  screenshotsFolder: this.folderName };
    }

    /**
     * 
     * @param {{url: string}} article 
     */
    async scrapeArticle(article) {
        let page;
        
        try {
            page = await this.context.newPage();
            await this._preparePage(page, article.url);
            
            //create a folder for the screenshots
            await this.createSSFolder();
    
    
            article.detailsTitle = await page.locator("h1").first().innerText();
            article.detailsDescription = await page.locator(".content-area").innerText({timeout: 3000});
    
            let imageBuffer = await page.locator(".content-area").screenshot({ type: "jpeg" });
            article.detailsScreenshotPath = this._generateImagePath(article.detailsTitle, ".jpeg");
            await writeFile(article.detailsScreenshotPath, imageBuffer);
        }
        catch (e) {
            
        }
        finally {
            if (page) page.close();
        }

        return article;
    }

    async createSSFolder() {
        //create screenshots folder
        await mkdir(this.folderName, { recursive: true });
    }

    /**
     * 
     * @param {import("playwright").Page} page 
     */
    async _dismissCookies(page) {
        try {
            info("Dismissing cookies...");

            const cookieRejectButton = page.locator("#cmpwelcomebtnno");
            await cookieRejectButton.waitFor({ state: "visible", timeout: 3000 });
            await cookieRejectButton.click();
            await cookieRejectButton.waitFor({ state: "hidden" });

            debug("Cookie consent form is dismissed.");
        }
        catch (e) {
            error("Exception thrown when handling cookie consent form (already dismissed?)");
            debug(e.message);
        }
    }

    /**
     * 
     * @param {import("playwright").Page} page 
     */
    async _hidePageHeader(page) {
        try {
            info("Hiding fixed page header...");

            const header = page.locator(".page-header");
            await header.evaluate((header) => header.hidden = true);
        }
        catch (e) {
            error("Exception thrown when trying to hide page header");
            debug(e.message);
        }
    }

    /**
     * Dismisses cookie disclaimer, scrolls to the bottom to force images to load, and hides page headers.
     * @param {import("playwright").Page} page 
     */
    async _preparePage(page, url) {
        //visit url
        await page.goto(url);

        //dismiss cookies
        await this._dismissCookies(page);

        //scroll to bottom to make images load
        await this._scrollToBottom(page, true);

        //hide header
        await this._hidePageHeader(page);
    }

    /**
     * 
     * @param {import("playwright").Page} page 
     */
    async _scrapeTopStorySection(page) {
        let articles = [];
        try {
            info("Scraping top story");
            let topStory = {};

            const topStoryContainer = page.locator("section.top-story");
            const titleLink = topStoryContainer.locator("h3 a");
            topStory.title = await titleLink.innerText();
            topStory.url = await titleLink.evaluate(link => link.href);

            let imageBuffer = await topStoryContainer.screenshot({ type: "jpeg" });
            topStory.screenshotPath = this._generateImagePath(topStory.title, ".jpeg");
            await writeFile(topStory.screenshotPath, imageBuffer);

            articles.push(topStory);
        }
        catch (e) {
            error("Exception thrown when scraping the top story");
            debug(e.message);
        }

        return articles;
    }

    /**
     * 
     * @param {import("playwright").Page} page 
     */
    async _scrapeNewsSection(page) {
        let articles = []; 

        try {
            info("Scraping news items");
            const newsItems = page.locator("div.news .news-item");
            debug(`Found ${await newsItems.count()} news items`);

            const newsItems_processed = [];
            for (let newsItem of await newsItems.all()) {
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

                    articles.push(newsItem_processed);
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

        return articles;
    }

    /**
     * 
     * @param {import("playwright").Page} page 
     */
    async _scrapeTeasersSections(page) {
        let articles = []; 

        try {
            info("Scraping article teasers");
            const teasers = page.locator(".teaser");
            debug(`Found ${await teasers.count()} article teasers`);

            const teasers_processed = [];

            for (let teaser of await teasers.all()) {
                try {
                    const teaser_processed = {};

                    teaser_processed.title = await teaser.locator(".teaser-data a").first().innerText();

                    try { teaser_processed.description = await teaser.locator(".teaser-data .teaser-description").innerText({ timeout: 1000 }); }
                    catch (e) { console.log("No description for " + teaser_processed.title); }

                    teaser_processed.url = await teaser.locator(".teaser-data a").first().evaluate(link => link.href);

                    teasers_processed.push(teaser_processed);

                    const imageBuffer = await teaser.screenshot({ type: "jpeg" });
                    teaser_processed.screenshotPath = this._generateImagePath(teaser_processed.title, ".jpeg");
                    await writeFile(teaser_processed.screenshotPath, imageBuffer);

                    articles.push(teaser_processed);
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
        
        return articles;
    }

    /**
     * Returns a string identifier that uniquely identifies the article within the same source, so that you can track different versions of the same article.
     * E.g. when article title is edited to fix a typo, you can check this identifier to make sure you don't treat it as a new article.
     * @param {*} article 
     * @returns {string} The identifier, such as "a-234523" or null if not found.
     */
    determineSourceIdentifier(article) {
        return article?.url.match(/[^/]+$/)?.[0] ?? null;
    }
}


export default DWScraper;
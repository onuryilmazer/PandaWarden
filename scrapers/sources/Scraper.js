import { debug } from "../utils/logger.js";

class Scraper {
    /**
     * 
     * @param {import("playwright").BrowserContext} context The browser context in which a page will be created and the source will be scraped
     */
    constructor(context) {
        this.context = context;        
        this.folderName = `${process.env.DATA_FOLDER}/Scraper_${Date.now()}`;
    }

    /** 
    * Scrolls the page all the way down, slowly.
    * Can be used to trick lazy loading images to load.
    * @param {import("playwright").Page} page Playwright page that will be scrolled down.
    * @param {boolean} returnToTop True for scrolling the page back to the beginning after the function is done.
    * @param {number} waitAfterDone Number of miliseconds the function should wait before returning after it is done scrolling
    */
    async _scrollToBottom(page, returnToTop = true, waitAfterDone = 1500) {
        try {
            const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight );

            for(let i = 0; i < pageHeight; i += 300) {
                await page.evaluate((i) => {
                    window.scrollTo({top: i, left: 0, behavior: "smooth"});
                }, i);

                await this._sleep(100);
            }

            if (waitAfterDone > 0) {
                await this._sleep(waitAfterDone);
            }

            if (returnToTop) {
                await page.evaluate(() => window.scrollTo({top: 0, left: 0}));
            }

            if (waitAfterDone > 0) {
                await this._sleep(waitAfterDone);
            }
        }
        catch (e) {
            error("Exception thrown when trying to scroll the page down");
            debug(e.message);
        }
    }

    /**
     * Returns a promise that resolves after ms miliseconds
     * @param {number} ms Miliseconds
     * @returns {Promise<true>}
     */
    async _sleep(ms) {
        const sleepPromise = new Promise((resolve) => setTimeout(() => resolve(true), ms));
        return sleepPromise;
    }

    /**
     * Generates a unique, sanitized image path from the given title by appending the timestamp and the extension to it, and then appending it all to the folderName of the scraper.
     * @param {string} title A title that will serve as the basis for the filename. This string will be sanitized to remove non-alphanumeric characters.
     * @param {string} extension A file extension, including the dot. Example: ".jpeg"
     * @returns {string}
     */
    _generateImagePath(title, extension) {
        return this.folderName + "/" + title.replace(/[^a-z0-9]/gi, '_') + "-" + Date.now() + extension;
    }
}


export default Scraper;
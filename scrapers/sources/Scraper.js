class Scraper {
    /**
     * @param {import("playwright").BrowserContext} context 
     */
    constructor(context) {
        this.context = context;        
        this.folderName = `Scraper_${Date.now()}`;
    }

    /**
     * Destroys the scraper instance by closing the page.
     */
    async _destroy() {
        if (!this._initialized) throw new Error("Can't destroy before initialization");

        await this.page.close();
        this._initialized = false;
    }

    /** 
    * Scrolls the page all the way down, slowly.
    * Can be used to trick lazy loading images to load.
    * @param {import("playwright").Page} page Playwright page that will be scrolled down.
    * @param {boolean} returnToTop True for scrolling the page back to the beginning after the function is done.
    * @param {number} waitAfterOne Number of miliseconds the function should wait before returning after it is done scrolling
    */
    async _scrollToBottom(returnToTop = true, waitAfterDone = 1500) {
        const pageHeight = await this.page.evaluate(() => document.documentElement.scrollHeight );

        for(let i = 0; i < pageHeight; i += 300) {
            await this.page.evaluate((i) => {
                window.scrollTo({top: i, left: 0, behavior: "smooth"});
            }, i);

            await this._sleep(100);
        }

        if (waitAfterDone > 0) {
            await this._sleep(waitAfterDone);
        }

        if (returnToTop) {
            await this.page.evaluate(() => window.scrollTo({top: 0, left: 0}));
        }

        if (waitAfterDone > 0) {
            await this._sleep(waitAfterDone);
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
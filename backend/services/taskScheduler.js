import { scheduleJob } from "node-schedule";
import scrapingService from "./scrapingService.js";

class TaskScheduler {
    constructor() {
        this.scrapingTask = scheduleJob("0,15,30,45 * * * *", async () => {
            console.log("Scraping task started.");

            const sourceIds = await scrapingService.availableSources();

            for (let sourceId of sourceIds) {
                try {
                    await scrapingService.scrapeHomepage(sourceId);
                    await scrapingService.scrapeAllMissingArticleDetails(sourceId);
                } catch (e) {
                    console.error(`Error while scraping ${sourceId}: ${e.message}`);
                }
            }

            //TODO send notification to users if they have relevant subscriptions
        });
    }

    getNextInvocation() {
        return this.scrapingTask.nextInvocation();
    }

    cancelNextInvocation() {
        this.scrapingTask.cancelNext();
    }
}

export default new TaskScheduler();
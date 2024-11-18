import { scheduleJob } from "node-schedule";
import scrapingService from "./scrapingService.js";
import { monitoringService } from "./monitoringService.js";
import { aiService } from "./aiService.js";

class TaskScheduler {
    constructor() {
        this.scrapingTask = scheduleJob("0,30 * * * *", async () => {
            console.log("Scraping task started.");

            const sourceIds = await scrapingService.availableSources();

            for (let sourceId of sourceIds) {
                try {
                    await scrapingService.scrapeHomepage(sourceId);
                    await scrapingService.scrapeAllMissingArticleDetails(sourceId);
                    if (process.env.NODE_ENV == "production") await aiService.generateAndSaveArticleSummariesForAllArticles();
                } catch (e) {
                    console.error(`Error while scraping ${sourceId}: ${e.message}`);
                }
            }

            //TODO send notification to users if they have relevant subscriptions
        });

        this.monitoringTask = scheduleJob("5,20,35,50 * * * *", async () => {
            console.log("Monitoring task started.");

            try {
                await monitoringService.executeAllStaleMonitoringRequests();
            }
            catch (e) {
                console.error(`Error while executing stale monitoring requests: ${e.message}`);
            }
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
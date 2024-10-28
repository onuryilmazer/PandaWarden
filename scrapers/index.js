import { scraperPool } from "./ScraperPool.js";

let count = 0;

const errorLogger = (e) => {
    console.log(`Error CAUGHT ${e.message}`)

    count++;
    
    if (count == 5) {
        console.log("can destroy pool now");
        scraperPool._destroyPool();
    }
}

scraperPool.scrape("DW").then(r => console.log(r)).catch(errorLogger);
scraperPool.scrape("DW").then(r => console.log(r)).catch(errorLogger);
scraperPool.scrape("DW").then(r => console.log(r)).catch(errorLogger);
scraperPool.scrape("DW").then(r => console.log(r)).catch(errorLogger);
scraperPool.scrape("DW").then(r => console.log(r)).catch(errorLogger);
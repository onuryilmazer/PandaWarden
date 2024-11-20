let isScrapingInProgress = false;

const checkScrapingLock = (req, res, next) => {
    if (isScrapingInProgress) {
        res.status(409);
        return next(new Error("A scraping task is already in progress. Please try again later."));
    }
    next();
};

const acquireScrapingLock = () => {
    if (isScrapingInProgress) throw new Error("Can't acquire scraping lock");

    isScrapingInProgress = true;
}

const releaseScrapingLock = () => {
    //if (!isScrapingInProgress) console.log("Can't release scraping lock (lock not acquired)");

    isScrapingInProgress = false;
}

export { checkScrapingLock, acquireScrapingLock, releaseScrapingLock };
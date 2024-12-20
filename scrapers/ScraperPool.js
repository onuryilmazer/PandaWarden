import "./utils/config.js";
import { fork } from 'child_process';
import { scrapers } from './sources/index.js';
import EventEmitter from 'events';
import Queue from 'yocto-queue';

/**
 * jobQueueChanged event
 * @event ScraperPool#jobQueueChanged
 * @type {number}
 */


class ScraperPool extends EventEmitter {    
    initialized = false;
    workerScript = import.meta.dirname + "/ScraperWorker.js";
    numberOfWorkers;
    workers = new Set();
    freeWorkers = new Queue();
    jobQueue = new Queue();
    nrOfActiveJobs = 0;         //jobs that are waiting in the queue + those that are currently running

    /**
     * 
     * @param {number} numberOfWorkers The number of scraper processes that should be created (each will have a Browser instance)
     */
    constructor(numberOfWorkers = 2) {
        super();  //for access to the EventEmitter methods
        this.numberOfWorkers = numberOfWorkers;
        this._initialize();
    }

    _initialize() {
        if (this.initialized) return;

        for(let i = 0; i < this.numberOfWorkers; i++) this._addWorker();
        this.initialized = true;
    }

    _addWorker() {
        const worker = fork(this.workerScript);
        this.workers.add(worker);
        this.freeWorkers.enqueue(worker);
    }

    _removeWorker(worker) {
        this.workers.delete(worker);
        worker.kill();
    }

    /**
     * 
     * @param {string} source The name of the source that will be scraped for content.
     * @fires ScraperPool#jobQueueChanged
     * @returns {Promise<{ok: true, data} | {ok: false, error: string}>}
     */
    scrapeHomepage(source) {
        return this._queueJob({target: "homepage", source});
    }

    /**
     * 
     * @param {string} source The name of the source that will be scraped for content
     * @param {{url: string}} article Details of the article that needs to be scraped
     * @fires ScraperPool#jobQueueChanged
     * @returns {Promise<{ok: true, data} | {ok: false, error: string}>}
     */
    scrapeArticle(source, article) {
        return this._queueJob({target: "article", source, article});
    }

    _queueJob(details) {
        let queuedJobPromise = new Promise((resolve, reject) => {
            this.jobQueue.enqueue({
                command: "scrape", 
                details,
                resolve, 
                reject
            });

            this.nrOfActiveJobs++;
            this.emit("jobQueueChanged", this.nrOfActiveJobs);
        });

        if (this.freeWorkers.size > 0) this._processQueue();

        return queuedJobPromise;
    }

    /**
     * 
     * @returns {string[]}
     */
    availableSources() {
        return [...scrapers.keys()];
    }

    /**
     * @fires ScraperPool#jobQueueChanged
     * @returns 
     */
    _processQueue() {
        if (this.jobQueue.size === 0 || this.freeWorkers.size === 0) return;
        
        //find an available worker (discarding invalid ones):
        const worker = this.freeWorkers.dequeue();
        if (!worker.connected || worker.killed) return this._processQueue();

        //dequeue a job:
        let job = this.jobQueue.dequeue();

        //send the job
        worker.send({
            command: job.command,
            details: job.details,
        });

        //describe what needs to be done when a result arrives from the worker
        const successHandler = (message) => {
            this.nrOfActiveJobs--;
            this.emit("jobQueueChanged", this.nrOfActiveJobs);

            if (message.ok) {
                job.resolve(message.data);
            }
            else {
                job.reject(message.error);
            }

            worker.removeListener("message", successHandler);
            worker.removeListener("error", failureHandler);
            worker.removeListener("exit", failureHandler);

            this.freeWorkers.enqueue(worker);
            this._processQueue();
        }

        //the "error" event may trigger together with "exit", this flag prevents handling the same failure twice
        let failureHandled = false;
        const failureHandler = async (error) => {
            if (failureHandled) return;
            failureHandled = true;

            this.nrOfActiveJobs--;          //TODO requeue jobs for a fixed number of times after failure
            this.emit("jobQueueChanged", this.nrOfActiveJobs);

            job.reject(`Scraper worker failed with the following error: ${error}`);

            this._removeWorker(worker);
            this._addWorker();
            this._processQueue();
        }

        worker.on("message", successHandler);
        worker.on("error", failureHandler);
        worker.on("exit", failureHandler);
    }

    /**
     * Destroys the scraper pool by killing all worker processes.
     */
    destroyPool() {
        while (this.workers.size > 0) {
            this._removeWorker(this.workers.values().next().value);
        }

        this.initialized = false;
    }
}

export { ScraperPool };
//import 'dotenv/config';
import { fork } from 'child_process';


class ScraperPool {    
    initialized = false;
    workerScript = "ScraperWorker.js";
    numberOfWorkers;
    workers = new Set();
    availableWorkers = new Set();
    jobQueue = [];

    constructor(numberOfWorkers = 2) {
        this.numberOfWorkers = numberOfWorkers;
        this._initialize();
    }

    async _initialize() {
        for(let i = 0; i < this.numberOfWorkers; i++) this._addWorker();
        this.initialized = true;
    }

    _addWorker() {
        const worker = fork(this.workerScript);
        this.workers.add(worker);
        this.availableWorkers.add(worker);
    }

    _removeWorker(worker) {
        this.workers.delete(worker);
        this.availableWorkers.delete(worker);
        worker.kill();
    }

    async scrape(source) {
        let queuedJobPromise = new Promise((resolve, reject) => {
            this.jobQueue.push({source, resolve, reject});
        });

        if (this.availableWorkers.size > 0) this.processQueue();

        return queuedJobPromise;
    }

    processQueue() {
        if (this.jobQueue.length === 0) return;
        
        let {source, resolve, reject} = this.jobQueue.shift();
        
        const worker = this.availableWorkers.values().next().value;
        this.availableWorkers.delete(worker);

        const successHandler = (message) => {
            resolve(message);
            worker.removeListener("message", successHandler);
            worker.removeListener("error", failureHandler);

            this.availableWorkers.add(worker);
            this.processQueue();
        }

        const failureHandler = async (error) => {
            console.log("Rejecting task and creating new worker due to error");
            reject(error);
            this._removeWorker(worker);
            this._addWorker();
            this.processQueue();
        }

        worker.on("message", successHandler);
        worker.on("error", failureHandler);

        worker.send(source);
    }

    _destroyPool() {
        while(this.workers.size > 0) {
            this._removeWorker(this.workers.values().next().value);
        }
    }
}

const scraperPool = new ScraperPool();

export { scraperPool };
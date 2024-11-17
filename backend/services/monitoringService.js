import { articleSearcher } from "./articleSearchService.js";
import * as db from "./databaseService.js";

class MonitoringService {
    constructor(db) {
        this.db = db;
    }

    async getStaleMonitoringRequests() {
        const result = await this.db.query(
            `SELECT * FROM monitoring_requests 
            WHERE 
            active = true AND
            (last_execution IS NULL OR last_execution < NOW() - repeat_interval)`
        );

        for (let request of result.rows) {

            //fetch keywords of request
            const keywordsQuery = await this.db.query(
                `SELECT keyword FROM monitoring_requests_keywords
                WHERE request_id = $1`,
                [request.id]
            );

            request.keywords = keywordsQuery.rows.map(row => row.keyword);


            //fetch sources of request
            const sourcesQuery = await this.db.query(
                `SELECT source_id FROM monitoring_requests_sources
                WHERE request_id = $1`,
                [request.id]
            );

            request.sources = sourcesQuery.rows.map(row => row.source_id);
        }

        return result.rows;
    }

    async createMonitoringRequest({owner, repeatIntervalSeconds, keywords, sourceIds}) {
        console.log(`Creating monitoring request for owner ${owner} with repeat interval ${repeatIntervalSeconds} seconds, keywords ${keywords} and sources ${sourceIds}`);
        //throws an error if the repeatIntervalSeconds is not one of the allowed values
        if (![15 * 60, 60 * 60, 60 * 60 * 12, 60 * 60 * 24].includes(repeatIntervalSeconds)) {
            throw new Error("Invalid repeat interval.");
        }

        //todo convert this into a transaction, revert if any of the inserts fail

        const result = await this.db.query(
            `INSERT INTO monitoring_requests (owner, active, execution_count, repeat_interval)
            VALUES ($1, true, 0, make_interval(secs => $2))
            RETURNING id`,
            [owner, repeatIntervalSeconds]
        );

        const requestId = result.rows[0].id;

        for (let keyword of keywords) {
            await this.db.query(
                `INSERT INTO monitoring_requests_keywords (request_id, keyword)
                VALUES ($1, $2)`,
                [requestId, keyword]
            );
        }

        for (let sourceId of sourceIds) {
            await this.db.query(
                `INSERT INTO monitoring_requests_sources (request_id, source_id)
                VALUES ($1, $2)`,
                [requestId, sourceId]
            );
        }

        await this.executeAllStaleMonitoringRequests();

        return requestId;
    }

    async executeMonitoringRequest(request) {
        const articlesToKeywords = new Map();

        for(let keyword of request.keywords) {
            const articles = await articleSearcher.query(keyword, request.last_execution, request.sources);
            
            for(const article of articles) {
                if (!articlesToKeywords.has(article)) {
                    articlesToKeywords.set(article, []);
                }

                articlesToKeywords.get(article).push(keyword);
            }
        }

        for(const [articleId, keywords] of articlesToKeywords) {
            await this.db.query(
                `INSERT INTO monitoring_requests_results (monitoring_request_id, article_id, keywords)
                VALUES ($1, $2, $3)`,
                [request.id, articleId, keywords.join(", ")]
            );
        }

        //update the last_execution of monitoring request
        await this.db.query(
            `UPDATE monitoring_requests
            SET last_execution = NOW(), execution_count = execution_count + 1
            WHERE id = $1`,
            [request.id]
        );

        console.log(`Executed monitoring request ${request.id} and found ${articlesToKeywords.size} new articles.`);
    }

    async executeAllStaleMonitoringRequests() {
        const staleRequests = await this.getStaleMonitoringRequests();

        for (let request of staleRequests) {
            await this.executeMonitoringRequest(request);
        }
    }

}

const monitoringService = new MonitoringService(db);

export { monitoringService };
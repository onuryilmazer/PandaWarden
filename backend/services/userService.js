import * as db from "./databaseService.js";
import bcrypt, { hash } from "bcrypt";
import { sign_promisified, verify_promisified } from "../utils/jwt-promisify.js";
import { monitoringService } from "./monitoringService.js";

class UserService {
    async registerUser({username, email, password}) {
        const id = await this._saveUserIntoDatabase({username, email, password});
        await this.createPlaceholderMonitoringRequests(id);
        return id;
    }

    async listUsers() {
        return (await db.query("SELECT * FROM users")).rows;
    }

    /**
     * Checks the user information and creates an authorization token if the credentials are correct.
     * @param {{username: string, password: string}} loginInfo 
     * @returns {string}
     */
    async createAuthToken({username, password}) {
        const userQuery = await db.query(
            "SELECT id, username, email, password FROM users WHERE username = $1", 
            [username]
        );

        let hashComparisonResult;
        if (userQuery.rows.length > 0) {
            hashComparisonResult = await bcrypt.compare(password, userQuery.rows[0].password);
        }

        if (userQuery.rows.length === 0 || !hashComparisonResult) {
            //Don't give potential hackers unnecessary information (pass or username, which one is wrong?)
            throw new Error("Wrong username and/or password");
        }

        //Create token  
        const claim = {
            id: userQuery.rows[0].id,
            username: userQuery.rows[0].username,
            email: userQuery.rows[0].email
        };

        const token = await sign_promisified(
            claim, 
            process.env.JWT_KEY, 
            {expiresIn: +process.env.JWT_EXPIRATION}
        );

        return token;
    }

    /**
     * Verifies the authenticity of the given token
     * @param {string} token 
     * @returns {Promise<>}
     */
    async verifyAuthToken(token) {
        const verifiedToken = await verify_promisified(token, process.env.JWT_KEY);
        return verifiedToken;
    }

    /**
     * 
     * @param {string} username 
     * @returns {Promise<boolean>} true if username is being used.
     */
    async usernameIsBeingUsed(username) {
        const usernameQuery = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        return usernameQuery.rows.length !== 0;
    }

    /**
     * 
     * @param {string} email 
     * @returns {Promise<boolean>} true if email is being used.
     */
    async emailIsBeingUsed(email) {
        const emailQuery = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        return emailQuery.rows.length !== 0;
    }

    async getUserRole(username) {
        const roleQuery = await db.query("SELECT * FROM users WHERE username = $1", [username]);

        if (roleQuery.rows.length === 0) throw new Error("User not found.");

        return roleQuery.rows[0].role;
    }

    /**
     * 
     * @param {string} password 
     * @returns {Promise<string>} Salted and hashed password
     */
    async _hashPassword(password) {
        const hashedPw = await bcrypt.hash(password, +process.env.BCRYPT_SALT_ROUNDS);
        return hashedPw;
    }

    /**
     * Saves user into database.
     * @param {{username: string, email: string, password: string}} userInfo 
     * @returns { Promise<true> }
     */
    async _saveUserIntoDatabase({username, email, password}) {
        if (await this.usernameIsBeingUsed(username)) throw new Error("Username is being used by someone else.");
        if (await this.emailIsBeingUsed(email)) throw new Error("E-mail is already registered.");

        const hashedPw = await this._hashPassword(password);

        const registrationQuery = await db.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id", 
            [username, email, hashedPw]
        );

        if (registrationQuery.rowCount === 0) {
            throw new Error("User could not be persisted into database.");
        }
        
        return registrationQuery.rows[0].id;
    }

    async createPlaceholderMonitoringRequests(userId) {
        await monitoringService.createMonitoringRequest({owner: userId, repeatIntervalSeconds: 15*60, keywords: ["lithium", "battery"], sourceIds: [1]}, true);
    }

    async getUserDetails(username) {
        const userDetailsQuery = await db.query("SELECT id, username, email, created_at FROM users WHERE username = $1", 
            [username]
        );

        if (userDetailsQuery.rows.length === 0) throw new Error("User does not exist");

        return userDetailsQuery.rows[0];
    }

    async getMonitoringRequestsOfUser(userId) {
        const monitoringRequestsQuery = await db.query(
            `SELECT * FROM monitoring_requests WHERE owner = $1 ORDER BY id ASC`,
            [userId]
        );

        for (let request of monitoringRequestsQuery.rows) {
            const keywordsQuery = await db.query(
                `SELECT keyword FROM monitoring_requests_keywords
                WHERE request_id = $1`,
                [request.id]
            );

            request.keywords = keywordsQuery.rows.map(row => row.keyword);

            const sourcesQuery = await db.query(
                `SELECT source_id, source_name FROM monitoring_requests_sources
                LEFT JOIN sources ON monitoring_requests_sources.source_id = sources.id
                WHERE request_id = $1`,
                [request.id]
            );

            request.sources = sourcesQuery.rows.map(row => row.source_name);

            const countQuery = await db.query(
                `SELECT COUNT(*) AS count FROM monitoring_requests_results
                WHERE monitoring_request_id = $1`,
                [request.id]
            );

            request.resultCount = countQuery.rows[0].count;
        }

        return monitoringRequestsQuery.rows;
    }

    async getMonitoringRequestOfUser(userId, requestId) {
        const monitoringRequestQuery = await db.query(
            `SELECT * FROM monitoring_requests WHERE owner = $1 AND id = $2`,
            [userId, requestId]
        );

        if (monitoringRequestQuery.rows.length === 0) throw new Error("Request does not exist or does not belong to the user.");

        const request = monitoringRequestQuery.rows[0];

        const keywordsQuery = await db.query(
            `SELECT keyword FROM monitoring_requests_keywords
            WHERE request_id = $1`,
            [request.id]
        );

        request.keywords = keywordsQuery.rows.map(row => row.keyword);

        const sourcesQuery = await db.query(
            `SELECT source_id, source_name FROM monitoring_requests_sources
            LEFT JOIN sources ON monitoring_requests_sources.source_id = sources.id
            WHERE request_id = $1`,
            [request.id]
        );

        request.sources = sourcesQuery.rows.map(row => row.source_name);

        const countQuery = await db.query(
            `SELECT COUNT(*) AS count FROM monitoring_requests_results
            WHERE monitoring_request_id = $1`,
            [request.id]
        );

        request.resultCount = countQuery.rows[0].count;

        const resultsQuery = await db.query(
            `SELECT mrr.article_id, mrr.keywords,
            a.id, a.catalog_title, a.catalog_description, a.catalog_screenshot_path, a.details_url, a.created_at, 
            s.source_name 
            FROM monitoring_requests_results AS mrr
            LEFT JOIN articles AS a ON mrr.article_id = a.id
            LEFT JOIN sources AS s ON a.source_id = s.id
            WHERE mrr.monitoring_request_id = $1
            ORDER BY a.created_at DESC`,
            [request.id]
        );

        request.results = resultsQuery.rows;

        return request;
    }

    async deleteMonitoringRequest(userId, requestId) {
        //check if request exists and belongs to the user
        const requestQuery = await db.query(
            "SELECT * FROM monitoring_requests WHERE id = $1",
            [requestId]
        );

        if (requestQuery.rows.length === 0) throw new Error("Request does not exist.");
        else if (requestQuery.rows[0].owner !== userId) throw new Error("Request does not belong to the user.");
        
        //delete request
        await db.query(
            "DELETE FROM monitoring_requests WHERE id = $1",
            [requestId]
        );
    }

    /**
     * 
     * @param {*} userId 
     * @param {*} requestId 
     * @returns {boolean} The new active status of the request
     */
    async toggleMonitoringRequestActive(userId, requestId) {
        //check if request exists and belongs to the user
        const requestQuery = await db.query(
            "SELECT * FROM monitoring_requests WHERE id = $1",
            [requestId]
        );

        if (requestQuery.rows.length === 0) throw new Error("Request does not exist.");
        else if (requestQuery.rows[0].owner !== userId) throw new Error("Request does not belong to the user.");

        //toggle active status
        let result = await db.query(
            `UPDATE monitoring_requests
            SET active = NOT active
            WHERE id = $1
            RETURNING active`,
            [requestId]
        );

        return result.rows[0].active;
    }
}

const userService = new UserService();

export default userService;
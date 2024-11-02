import * as db from "./databaseService.js";
import bcrypt, { hash } from "bcrypt";
import { sign_promisified, verify_promisified } from "../utils/jwt-promisify.js";

class UserService {
    /**
     * 
     * @param {string} username 
     * @returns {boolean} true if username is being used.
     */
    async usernameIsBeingUsed(username) {
        const usernameQuery = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        return usernameQuery.rows.length !== 0;
    }

    /**
     * 
     * @param {string} email 
     * @returns {boolean} true if email is being used.
     */
    async emailIsBeingUsed(email) {
        const emailQuery = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        return emailQuery.rows.length !== 0;
    }

    /**
     * 
     * @param {string} password 
     * @returns {string} Salted and hashed password
     */
    async hashPassword(password) {
        const hashedPw = await bcrypt.hash(req.body.password, +process.env.BCRYPT_SALT_ROUNDS);
        return hashedPw;
    }

    /**
     * Saves user into database.
     * @param {{username: string, email: string, password: string}} userInfo 
     * @returns { {ok: true, data: {username: string, email: string}} | {ok: false, error: Error} }
     */
    async persistUserIntoDatabase({username, email, password}) {
        let result = {};

        try {
            if (await this.usernameIsBeingUsed(username)) throw new Error("Username is being used by someone else.");
            if (await this.emailIsBeingUsed(email)) throw new Error("E-mail is already registered.");

            const hashedPw = await this.hashPassword(password);

            const registrationQuery = await db.query(
                "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *", 
                [username, email, hashedPw]
            );

            if (registrationQuery.rowCount !== 0) {
                result.ok = true;
                result.data = {
                    username: registrationQuery.rows[0].username, 
                    email: registrationQuery.rows[0].email
                };
            }
            else {
                throw new Error("User could not be persisted into database.");
            }
        }
        catch (e) {
            result.ok = false;
            result.error = e.toString();
        }

        return result;
    }

    /**
     * Checks the user information and creates an authorization token if the credentials are correct.
     * @param {{username: string, password: string}} loginInfo 
     * @returns {{ok: true, token: string} | {ok: false, error: Error}}
     */
    async createAuthToken({username, password}) {
        let result = {};

        try {
            const userQuery = await db.query(
                "SELECT username, email, password FROM users WHERE username = $1", 
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
                username: userQuery.rows[0].username,
                email: userQuery.rows[0].email
            };

            const token = await sign_promisified(
                claim, 
                process.env.JWT_KEY, 
                {expiresIn: +process.env.JWT_EXPIRATION}
            );

            result.ok = true;
            result.token = token;
        }
        catch (e) {
            result.ok = false;
            result.error = e.toString();
        }
        
        return result;
    }

    /**
     * Verifies the authenticity of the given token
     * @param {string} token 
     * @returns {Promise<{ok: true, token: string} | {ok: false, error: Error}>}
     */
    async verifyAuthToken(token) {
        let result = {};

        try {
            const verifiedToken = await verify_promisified(token, process.env.JWT_KEY);
            result.ok = true;
            result.token = verifiedToken;
        }
        catch (e) {
            result.ok = false;
            result.error = e.toString();
        }

        return result;
    }
}

const userService = new UserService();

export default userService;
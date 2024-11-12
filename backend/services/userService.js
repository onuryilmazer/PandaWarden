import * as db from "./databaseService.js";
import bcrypt, { hash } from "bcrypt";
import { sign_promisified, verify_promisified } from "../utils/jwt-promisify.js";

class UserService {
    async registerUser({username, email, password}) {
        return this._saveUserIntoDatabase({username, email, password});
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
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", 
            [username, email, hashedPw]
        );

        if (registrationQuery.rowCount === 0) {
            throw new Error("User could not be persisted into database.");
        }
        
        return true;
    }

    async getUserDetails(username) {
        const userDetailsQuery = await db.query("SELECT id, username, email, created_at FROM users WHERE username = $1", 
            [username]
        );

        if (userDetailsQuery.rows.length === 0) throw new Error("User does not exist");

        return userDetailsQuery.rows[0];
    }
}

const userService = new UserService();

export default userService;
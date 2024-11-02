import { verify_promisified } from "../utils/jwt-promisify.js";

async function checkAuthToken(req, res, next) {
    const authHeader = req.get("Authorization");
    const authHeaderParts = authHeader.split(" ");

    if (authHeaderParts.length != 2 || authHeaderParts[0] !== "Bearer") {
        return res.status(400).json({error: "Malformed authorization header."});
    }
    
    try {
        const token = await verify_promisified(authHeaderParts[1], process.env.JWT_KEY);
        req.token = token;
        next();
    }
    catch (e) {
        return res.status(401).json({error: e.name});
    }
}

export default checkAuthToken;
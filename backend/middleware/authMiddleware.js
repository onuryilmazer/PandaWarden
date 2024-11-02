import userService from "../services/userService.js";

async function checkAuthToken(req, res, next) {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
        return res.status(400).json({
            ok: false,
            error: "Authorization header missing."
        });
    }

    const authHeaderParts = authHeader.split(" ");

    if (authHeaderParts.length != 2 || authHeaderParts[0] !== "Bearer") {
        return res.status(400).json({
            ok: false,
            error: "Malformed authorization header."
        });
    }

    const authResult = await userService.verifyAuthToken(authHeaderParts[1]);

    if (authResult.ok) {
        req.token = authResult.token;
        return next();
    }
    else {
        return res.status(401).json(authResult);
    }
}

export default checkAuthToken;
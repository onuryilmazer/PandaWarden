import userService from "../services/userService.js";

async function checkAuthToken(req, res, next) {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
        res.status(400);
        return next(new Error("Authorization header is missing."));
    }

    const authHeaderParts = authHeader.split(" ");

    if (authHeaderParts.length != 2 || authHeaderParts[0] !== "Bearer") {
        res.status(400);
        return next(new Error("Malformed authorization header."));
    }

    try {
        req.token = await userService.verifyAuthToken(authHeaderParts[1]);
        return next();
    }
    catch (e) {
        res.status(401);
        return next(e);
    }
}

async function checkAdminRights(req, res, next) {
    async function roleChecker(error) {
        if (error) return next(error);

        if (await userService.usernameIsBeingUsed(req.token.username) 
            && await userService.getUserRole(req.token.username) === "admin") {
                next();
        }
        else {
            res.status(401);
            next(new Error("Insufficient rights"));
        }
    }

    await checkAuthToken(req, res, roleChecker);
}

export {checkAuthToken, checkAdminRights};
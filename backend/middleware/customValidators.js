//TODO complete custom validators.

import { body, validationResult } from "express-validator";

//email in use

//username in use


//raw user input
const userInputValidators = {
    email: () => {
        return body("email", "Invalid e-mail")
        .trim()
        .notEmpty().withMessage("E-mail can't be empty")
        .isEmail();
    }
};

const checkExistingValidators = (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        res.status(400);
        return next(new Error(validationErrors.array().map(e => e.msg).join("\n") ));
    }
    else {
        return next();
    }
}



export { userInputValidators, checkExistingValidators };
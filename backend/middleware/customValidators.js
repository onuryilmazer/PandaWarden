import { body } from "express-validator";

//email in use

//username in use


//raw user input
userInputValidators = {
    email: () => {
        return body("email", "Invalid e-mail")
        .trim()
        .notEmpty().withMessage("E-mail can't be empty")
        .isEmail();
    }
};


export { userInputValidators };
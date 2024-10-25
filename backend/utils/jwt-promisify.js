import jwt from "jsonwebtoken";

const sign_promisified = (payload, key, options) => {
    const promise = new Promise((resolve, reject) => {
        jwt.sign(payload, key, options, (err, decoded) => {
            if (err) reject(err);
            resolve(decoded);
        });
    });

    return promise;
}

const verify_promisified = (token, key, options) => {
    const promise = new Promise((resolve, reject) => {
        jwt.verify(token, key, options, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });

    return promise;
}


export {
    sign_promisified,
    verify_promisified,
}
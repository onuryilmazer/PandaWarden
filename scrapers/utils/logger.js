import chalk from "chalk";

//TODO send these logs to the process that initiated the scraper.

function info(message) {
    console.log( chalk.white(message) );
}

function debug(message) {
    console.log( chalk.gray(message) );
}

function error(message) {
    console.log( chalk.red(message) );
}

export {info, debug, error};
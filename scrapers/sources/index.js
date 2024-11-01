//Exports a map of all the source-scraper pairs.
//This map can be used to list all scrapable sources, or to get the concrete scraper implementation of a source.
import DWScraper from "./DWScraper.js";

const scrapers = new Map();
scrapers.set("DW", DWScraper);


export { scrapers };
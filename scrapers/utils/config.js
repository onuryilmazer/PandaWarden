//import dotenv, using ES6 imports, but also configure it to look into the file directory instead of cwd.
import dotenv from 'dotenv';
dotenv.config({ path: import.meta.dirname + "/../.env" });
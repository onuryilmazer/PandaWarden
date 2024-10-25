import mockData from "./mockData.json" with {type: "json"};
import pg from 'pg';
const { Pool } = pg;
 
const pool = new Pool();
 
const query = (text, params, callback) => {
  return pool.query(text, params, callback);
};


async function fetchUser(username) {
    return mockData.users.find((u) => u.username === username);
};

export { query, fetchUser };
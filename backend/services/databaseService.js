import pg from 'pg';
const { Pool } = pg;
 
const pool = new Pool();
 
const query = (text, params, callback) => {
  return pool.query(text, params, callback);
};

export { query };
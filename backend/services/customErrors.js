class DatabaseError extends Error {
  constructor() {
    super("Database connection failed.");
    this.name = 'DatabaseError';
  }
}

export {DatabaseError};
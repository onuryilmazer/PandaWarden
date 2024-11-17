class DatabaseError extends Error {
  constructor(message) {
    super(message ?? "Database connection failed.");
    this.name = 'DatabaseError';
  }
}

export {DatabaseError};
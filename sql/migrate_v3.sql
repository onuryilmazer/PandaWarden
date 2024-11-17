--- Creates a new table where the articles found in related monitoring requests are stored

CREATE TABLE monitoring_requests_results (
  monitoring_request_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  keywords TEXT NOT NULL,
  PRIMARY KEY (monitoring_request_id, article_id),
  FOREIGN KEY (monitoring_request_id) REFERENCES monitoring_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);
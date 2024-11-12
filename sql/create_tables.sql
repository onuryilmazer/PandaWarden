CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE sources (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR NOT NULL,
  language_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  source_id INTEGER,
  catalog_title VARCHAR NOT NULL,
  catalog_description TEXT,
  catalog_screenshot_path VARCHAR,
  details_title VARCHAR,
  details_description TEXT,
  details_aisummary TEXT,
  details_screenshot_path VARCHAR,
  details_url VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP 
);

CREATE TABLE article_details_translations (
  id SERIAL,
  language_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  title VARCHAR,
  description TEXT,
  aisummary TEXT,
  translation_rating DOUBLE PRECISION,
  rated_by_count INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  
  PRIMARY KEY (id, language_id)
);

CREATE TABLE article_catalog_translations (
  id SERIAL,
  language_id INTEGER NOT NULL,
  article_id INTEGER NOT NULL,
  title VARCHAR,
  description TEXT,
  translation_rating DOUBLE PRECISION,
  rated_by_count INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  
  PRIMARY KEY (id, language_id)
);

CREATE TABLE languages (
  id SERIAL PRIMARY KEY,
  language_name VARCHAR NOT NULL
);

CREATE TABLE monitoring_requests (
  id SERIAL PRIMARY KEY,
  owner INTEGER,
  active BOOLEAN,
  frequency_minutes INTEGER,
  execution_count INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE monitoring_requests_keywords (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL,
  keyword VARCHAR NOT NULL
);

CREATE TABLE monitoring_requests_sources (
  id SERIAL PRIMARY KEY,
  request_id INTEGER,
  source_id INTEGER
);

CREATE TABLE scraping_errors (
  id BIGSERIAL PRIMARY KEY,
  source_id INTEGER,
  time TIMESTAMP,
  error_message text,
  page_html text
);

ALTER TABLE articles ADD FOREIGN KEY (source_id) REFERENCES sources (id);

ALTER TABLE sources ADD FOREIGN KEY (language_id) REFERENCES languages (id);

ALTER TABLE article_catalog_translations ADD FOREIGN KEY (language_id) REFERENCES languages (id);
ALTER TABLE article_catalog_translations ADD FOREIGN KEY (article_id) REFERENCES articles (id);

ALTER TABLE article_details_translations ADD FOREIGN KEY (language_id) REFERENCES languages (id);
ALTER TABLE article_details_translations ADD FOREIGN KEY (article_id) REFERENCES articles (id);

ALTER TABLE monitoring_requests ADD FOREIGN KEY (owner) REFERENCES users (id);

ALTER TABLE monitoring_requests_keywords ADD FOREIGN KEY (request_id) REFERENCES monitoring_requests (id);

ALTER TABLE monitoring_requests_sources ADD FOREIGN KEY (request_id) REFERENCES monitoring_requests (id);
ALTER TABLE monitoring_requests_sources ADD FOREIGN KEY (source_id) REFERENCES sources (id);

ALTER TABLE scraping_errors ADD FOREIGN KEY (source_id) REFERENCES sources (id);
--- Alter the foreign key constraints of monitoring_requests_keywords and monitoring_requests_sources 
--- so that you can delete a monitoring request and all its keywords and sources will be deleted as well.

ALTER TABLE monitoring_requests_keywords DROP CONSTRAINT monitoring_requests_keywords_request_id_fkey;
ALTER TABLE monitoring_requests_keywords ADD FOREIGN KEY (request_id) REFERENCES monitoring_requests (id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE monitoring_requests_sources DROP CONSTRAINT monitoring_requests_sources_request_id_fkey;
ALTER TABLE monitoring_requests_sources DROP CONSTRAINT monitoring_requests_sources_source_id_fkey;
ALTER TABLE monitoring_requests_sources ADD FOREIGN KEY (request_id) REFERENCES monitoring_requests (id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE monitoring_requests_sources ADD FOREIGN KEY (source_id) REFERENCES sources (id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE monitoring_requests_results DROP CONSTRAINT monitoring_requests_results_article_id_fkey;
ALTER TABLE monitoring_requests_results DROP CONSTRAINT monitoring_requests_results_monitoring_request_id_fkey;
ALTER TABLE monitoring_requests_results ADD FOREIGN KEY (monitoring_request_id) REFERENCES monitoring_requests (id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE monitoring_requests_results ADD FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE ON UPDATE CASCADE;
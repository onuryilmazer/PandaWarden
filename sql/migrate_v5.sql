--- add the missing columns (repeat_interval etc) to monitoring requests table

ALTER TABLE monitoring_requests ADD COLUMN last_execution TIMESTAMP;
ALTER TABLE monitoring_requests ADD COLUMN repeat_interval INTERVAL NOT NULL DEFAULT make_interval(secs => 900);
ALTER TABLE monitoring_requests DROP COLUMN IF EXISTS frequency_minutes;

ALTER TABLE monitoring_requests ADD FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
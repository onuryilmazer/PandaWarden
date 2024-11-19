--- Creates a new column "identifier_within_source" that identifies the articles uniquely within the same source, thereby allowing you to identify that an article is not new but just an updated version of an existing one.
--- The new column is a generated postgresql column, and its value is generated from the details_url column, by taking the last part of the URL after the last slash.

ALTER TABLE articles ADD COLUMN identifier_within_source TEXT GENERATED ALWAYS AS (substring(details_url FROM '([^/]+)$')) STORED;
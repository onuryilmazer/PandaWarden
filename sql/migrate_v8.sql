--- This migration converts the generated column identifiere_within_source to a normal column while keeping existing values, and delegates the task of determining its value to the specific scraper for every source.
--- The reason being that different sources added to the system in the future may have different ways of identifying articles uniquely. 
--- Letting specific scrapers determine the value of this column allows for more flexibility.

ALTER TABLE articles ALTER COLUMN identifier_within_source DROP EXPRESSION;
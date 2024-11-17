-- Introduces fast full text search support for articles by creating a generated column for the documents

ALTER TABLE articles 
ADD COLUMN query_document tsvector 
GENERATED ALWAYS AS (
  to_tsvector( 
    'english',
    coalesce(catalog_title, '') || ' ' -- Use coalesce to ensure no null values are concatenated
    || coalesce(catalog_description, '') || ' ' 
    || coalesce(details_title, '') ||' ' 
    || coalesce(details_description, '') || ' ' 
    || coalesce(details_aisummary, '')
  )
) STORED;
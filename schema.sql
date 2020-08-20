DROP TABLE IF EXISTS table_locations;

CREATE TABLE table_locations (
id SERIAL PRIMARY KEY,
search_query VARCHAR(255),
latitude VARCHAR(255),
longitude VARCHAR(255),
formatted_query VARCHAR(255)
);
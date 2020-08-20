DROP TABLE IF EXISTS table_locations;

CREATE TABLE table_locations (
id SERIAL PRIMARY KEY,
search_query VARCHAR(255),
formatted_query VARCHAR(255),
latitude DECIMAL(10,7),
longitude DECIMAL(10,7)
);
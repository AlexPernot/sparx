# Sparx

A prospection tool that searches and collect data from the Google Places API in specific cities.

# Usage

- In the input.json file, enter the jobs you want to target in the "jobs" list, and the targeted cities in "cities".
The Google Places API understand natural language, the format is free.
- Create a `.env` file from the `.env.dist` file. Enter your Google API key and the DB URI. Your key must have access to the new Places API.
- Run `index.js`.

# Development

The `start_db.sh` script starts a PostgreSQL database via Docker. The volume path is hard-coded, you probably want to change it.

# Limitations

To prevent using all your credit in one go, results will only go up to the first page, so only 20 results per query.
import input from "./input.json" assert { type: "json" };
import "dotenv/config";
import prompts from "prompts";
import { fetchFromGooglePlaces } from "./google.js";
import { connect, disconnect, store } from "./db.js";

const requestCount = input.cities.length * input.jobs.length;
// We ignore the volume discount since we don't want to go over the free tier anyway.
const scriptCost = requestCount * 0.035;

const response = await prompts({
  type: "confirm",
  name: "confirmed",
  message: `input.json contains ${input.jobs.length} jobs and ${input.cities.length} cities. This makes ${requestCount} requests for a total cost of \$${scriptCost}. Do you want to continue?`,
});

if (!response.confirmed) {
  process.exit(0);
}

await connect();

for (const city of input.cities) {
  for (const job of input.jobs) {
    const places = await fetchFromGooglePlaces(`${job} in ${city}`);

    for (const place of places) {
      await store(place);
    }
  }
}

await disconnect();

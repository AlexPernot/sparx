import input from "./input.json" assert { type: "json" };
import "dotenv/config";
import prompts from "prompts";
import { fetchFromGooglePlaces } from "./google.js";
import {
  connect,
  disconnect,
  getPlacesWithoutEmail,
  saveEmailAddress,
  saveFacebookUrl,
  store,
} from "./db.js";
import { getEmailAddressInFacebookPage, getFacebookPage } from "./facebook.js";
import puppeteer from "puppeteer";

const { choice } = await prompts({
  type: "select",
  name: "choice",
  message: "Welcome to Sparx! What do you want to do?",
  choices: [
    {
      title: "Feed the database",
      description: "Get places from Google Maps and store them in database.",
      value: "getPlaces",
    },
    {
      title: "Find e-mail addresses",
      description: "Find e-mail addresses on Facebook pages",
      value: "getEmailAddresses",
    },
  ],
});

switch (choice) {
  case "getPlaces":
    await getPlaces();
    break;
  case "getEmailAddresses":
    await getEmailAddresses();
    break;
}

async function getPlaces() {
  const requestCount = input.cities.length * input.jobs.length;
  // We ignore the volume discount since we don't want to go over the free tier anyway.
  const scriptCost = requestCount * 0.035;

  const { confirmed } = await prompts({
    type: "confirm",
    name: "confirmed",
    message: `input.json contains ${input.jobs.length} jobs and ${input.cities.length} cities. This makes ${requestCount} requests for a total cost of \$${scriptCost}. Do you want to continue?`,
  });

  if (!confirmed) {
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
}

async function getEmailAddresses() {
  await connect();

  // Fetch businesses without e-mail address, preferably without a website
  const places = await getPlacesWithoutEmail();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const place of places) {
    // Search a facebook page
    const fbUrl = await getFacebookPage(page, place);

    if (!fbUrl) {
      console.log(
        `Could not find a facebook page for ${place.name}, skipping.`,
      );
      continue;
    }

    console.log(fbUrl);
    await saveFacebookUrl(place.id, fbUrl);

    // Search for an email address
    const email = await getEmailAddressInFacebookPage(page, fbUrl);
    if (!email) {
      console.log(
        `Could not find an e-mail address for ${place.name}, skipping.`,
      );
      continue;
    }

    await saveEmailAddress(place.id, email);
  }

  await browser.close();

  await disconnect();
}

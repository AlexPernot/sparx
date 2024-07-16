import pThrottle from "p-throttle";

const throttle = pThrottle({
  limit: 2,
  interval: 1000,
});

const throttledFetch = throttle(fetch);

const fieldMaskParts = [
  "places.id",
  "places.displayName",
  "places.types",
  "places.nationalPhoneNumber",
  "places.formattedAddress",
  "places.googleMapsUri",
  // Next parts trigger the "advanced" query (slightly more expensive)
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
];

export async function fetchFromGooglePlaces(query) {
  console.log(`Fetching "${query}" from google...`);
  const res = await throttledFetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_API_KEY,
        "X-Goog-FieldMask": fieldMaskParts.join(","),
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "fr",
      }),
    },
  );

  const { places } = await res.json();

  console.log(`Found ${places.length} results.`);

  return places;
}

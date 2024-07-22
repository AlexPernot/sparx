export async function getFacebookPage(page, place) {
  const [cityName] = place.address.match(/(?<=\b\d{5}\s)[^,]+/);

  if (!cityName) {
    console.warn(`Can't find a city name in ${place.address}, skipping.`);
    return;
  }

  console.log("Searching for " + `site:facebook.com ${place.name} ${cityName}`);

  await page.goto(
    `https://www.google.fr/search?q=${encodeURIComponent(`site:facebook.com ${place.name} ${cityName}`)}`,
  );
  return await page.$eval("h3", (h3) => h3.closest("a").href);
}

export async function getEmailAddressInFacebookPage(page, url) {
  // Navigate the page to a URL.
  await page.goto(url);
  const content = await page.content();

  const match = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  return Array.isArray(match) ? match[0] : null;
}

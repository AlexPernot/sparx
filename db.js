import postgres from "postgres";

const TABLE_NAME = "T_PLACES";

let sql;

export async function connect() {
  console.log(`Connecting to DB via ${process.env.DB_URI}...`);

  sql = postgres(process.env.DB_URI, {
    transform: {
      undefined: null,
    },
  });

  console.log("Connected.");

  await sql`CREATE TABLE IF NOT EXISTS ${sql(TABLE_NAME)} (
    id varchar not null,
    name varchar not null,
    types text[] not null,
    phone varchar,
    address varchar,
    gmaps_uri varchar,
    website_uri varchar,
    facebook_uri varchar,
    rating numeric(2,1),
    user_rating_count int,
    email varchar,
    PRIMARY KEY (id)
  )`;
}

export async function disconnect() {
  await sql.end();
}

// List of GMaps types that we don't want to store
const filteredTypes = ["point_of_interest", "establishment"];

export async function store(place) {
  if (!sql) {
    throw new Error("Can't store: DB connection is not initialized.");
  }

  const values = {
    id: place.id,
    name: place.displayName.text,
    types: place.types.filter((t) => !filteredTypes.includes(t)),
    phone: place.nationalPhoneNumber,
    address: place.formattedAddress,
    gmaps_uri: place.googleMapsUri,
    website_uri: place.websiteUri,
    rating: place.rating,
    user_rating_count: place.userRatingCount,
  };

  try {
    await sql`INSERT INTO ${sql(TABLE_NAME)} ${sql(values)} ON CONFLICT(id) DO NOTHING`;
  } catch (e) {
    console.error(
      "Next error happened while trying to store these values:",
      values,
    );
    console.error(e);
  }
}

export async function getPlacesWithoutEmail(limit = 100) {
  if (!sql) {
    throw new Error("Can't store: DB connection is not initialized.");
  }

  return await sql`SELECT * FROM ${sql(TABLE_NAME)} WHERE email IS NULL ORDER BY name LIMIT ${limit}`;
}

export async function saveFacebookUrl(id, url) {
  if (!sql) {
    throw new Error("Can't store: DB connection is not initialized.");
  }

  try {
    await sql`UPDATE ${sql(TABLE_NAME)} SET facebook_uri = ${url} WHERE id = ${id}`;
  } catch (e) {
    console.error(
      "Next error happened while trying to update the facebook url with:",
      url,
    );
    console.error(e);
  }
}

export async function saveEmailAddress(id, email) {
  if (!sql) {
    throw new Error("Can't store: DB connection is not initialized.");
  }

  try {
    await sql`UPDATE ${sql(TABLE_NAME)} SET email = ${email} WHERE id = ${id}`;
  } catch (e) {
    console.error(
      "Next error happened while trying to update the email address with:",
      email,
    );
    console.error(e);
  }
}

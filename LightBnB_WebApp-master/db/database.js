const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg"); //setup postgress as database

//setup pool to interact with db
const pool = new Pool({
  user: "labber",
  password: "labber",
  host: "localhost",
  database: "lightbnb",
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = (email) => {
  return pool
    .query(
      `
    SELECT id, name, email, password FROM users
    WHERE email = $1;
    `,
      [email]
    )
    .then((result) => {
      if (result.rows.length === 0) return null;
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = (id) => {
  return pool
    .query(
      `
    SELECT id, name, email, password FROM users
    WHERE id = $1;
    `,
      [id]
    )
    .then((result) => {
      if (result.rows.length === 0) return null;
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

const addUser = (user) => {
  const { name, email, password } = user;

  //CHECK IF EMAIL EXISTS TODO
  return pool
    .query(
      `
    SELECT * FROM users
    WHERE email = $2;
    `,
      [email]
    )
    .then((result) => {
      if (result.rows.length > 0) {
        throw new Error("User with this email already exists");
      }

      // Insert new user
      return pool.query(
        `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;
      `,
        [name, email, password]
      );
    })
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */

const getAllReservations = (guestId, limit = 10) => {
  return pool
    .query(
      `
      SELECT r.id as id, p.title as title, r.start_date as start_date, r.end_date as end_date, p.number_of_bathrooms, p.number_of_bedrooms, p.parking_spaces, p.cost_per_night, p.thumbnail_photo_url, AVG(pr.rating)
      FROM reservations r 
      JOIN properties p ON r.property_id=p.id
      JOIN property_reviews pr ON pr.property_id = p.id
      WHERE r.guest_id = $1
      GROUP BY r.id, p.title, r.start_date, p.cost_per_night, p.number_of_bathrooms, p.number_of_bedrooms, p.parking_spaces, p.thumbnail_photo_url
      ORDER BY r.start_date
      LIMIT $2;
      `,
      [guestId, limit]
    )
    .then((result) => {
      // console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = (options, limit = 10) => {
  const queryParams = [];

  let queryString = `
SELECT p.owner_id, p.id,p.title, p.number_of_bedrooms, p.number_of_bathrooms, p.parking_spaces, p.cost_per_night, p.thumbnail_photo_url, p.description, p.cover_photo_url, p.country, p.city, p.province, p.street, p.post_code, AVG(r.rating) as average_rating
FROM properties p JOIN property_reviews r
ON r.property_id = p.id
WHERE 1=1
`;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND p.city LIKE $${queryParams.length}`;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    queryString += ` AND p.cost_per_night >= $${queryParams.length}`;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    queryString += ` AND p.cost_per_night <= $${queryParams.length}`;
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += ` AND p.owner_id = $${queryParams.length}`;
  }

  queryString += ` 
GROUP BY p.id`;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` HAVING AVG(r.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
LIMIT $${queryParams.length};
`;

  return pool
    .query(queryString, queryParams)
    .then((res) => {
      return res.rows.length === 0
        ? console.log("No properties found within criteria")
        : res.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/* Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = (property) => {
  //destructure keys and values into arrays
  const columns = Object.keys(property);
  const values = Object.values(property);
  const placeholders = [];
  
  //placeholders for parameterized queries
  for (let i = 0; i < values.length; i++) {
    placeholders.push(`$${i + 1}`);
  }

  //queryString
  const qs = `
    INSERT INTO properties (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *;
  `;

  return pool
    .query(qs, values)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};

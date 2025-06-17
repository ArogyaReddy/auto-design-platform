// utils/data_manager.js
const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const dataDirectory = path.join(__dirname, '../test_data');
const loadedData = {}; // Cache for loaded JSON files

const USERS_FILE_PATH = path.join(__dirname, '..', 'test_data', 'users.json');
let usersData = null;

/**
 * Loads a JSON data file from the test_data directory.
 * Caches the loaded data to prevent redundant file reads.
 * @param {string} fileName The name of the JSON file (e.g., 'users.json').
 * @returns {object} The parsed JSON data.
 * @throws {Error} If the file is not found or is invalid JSON.
 */
function loadDataFile(fileName) {
    if (loadedData[fileName]) {
        return loadedData[fileName]; // Return from cache if already loaded
    }

    const filePath = path.join(dataDirectory, fileName);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Data file not found: ${filePath}`);
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        loadedData[fileName] = data; // Cache the data
        console.log(`[DataManager] Loaded data from: ${fileName}`);
        return data;
    } catch (error) {
        throw new Error(`Failed to load or parse data file ${fileName}: ${error.message}`);
    }
}

/**
 * Retrieves specific data from a loaded data file.
 * @param {string} dataFileName The name of the data file (e.g., 'users').
 * @param {string} dataKey The key within the JSON file (e.g., 'standard_user').
 * @returns {any} The requested data.
 * @throws {Error} If the file or key is not found.
 */
function getData(dataFileName, dataKey) {
    const fullFileName = `${dataFileName}.json`;
    const data = loadDataFile(fullFileName);

    if (!(dataKey in data)) {
        throw new Error(`Data key '${dataKey}' not found in file '${fullFileName}'`);
    }

    return data[dataKey];
}

// Function to generate a unique new user
function generateNewUser() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
    const username = faker.internet.userName({ firstName, lastName }) + faker.string.uuid().substring(0, 4);
    const password = faker.internet.password({ length: 12, memorable: true, pattern: /[A-Za-z0-9!@#$%^&*]/ });
    const streetAddress = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state({ abbreviated: true });
    const zipCode = faker.location.zipCode();
    // const phoneNumber = faker.phone.number('###-###-####');
    const phoneNumber = faker.phone.number();
    // const phoneNumber = faker.string.numeric(10);

    console.log(`[DataManager] Generating new user: ${username}`);

    return {
        firstName,
        lastName,
        email,
        username,
        password,
        address: {
            streetAddress,
            city,
            state,
            zipCode
        },
        phoneNumber
    };
}

// Example: Function to generate a new product
function generateNewProduct() {
    return {
        name: faker.commerce.productName() + ' ' + faker.string.uuid().substring(0, 6),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
        category: faker.commerce.department(),
        material: faker.commerce.productMaterial()
    };
}

/**
 * Retrieves a specific user's data by their key/type.
 * @param {string} userType - The key of the user in users.json (e.g., "standard_user").
 * @returns {object | null} The user object (or null if not found).
 */
function getUser(userType) {
  const allUsers = loadUsers(); // Ensures data is loaded
  if (allUsers && allUsers[userType]) {
    return allUsers[userType];
  }
  console.warn(`[DataManager] User type "${userType}" not found in users.json.`);
  return null;
}

/**
 * Loads user data from the JSON file.
 * Caches the data after the first read.
 * @returns {object} The parsed user data object.
 */
function loadUsers() {
  if (usersData) {
    return usersData;
  }
  try {
    console.log(`[DataManager] Loading data from: ${USERS_FILE_PATH}`); // Added log
    const rawData = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    usersData = JSON.parse(rawData);
    console.log(`[DataManager] Successfully loaded ${Object.keys(usersData).length} user entries.`); // Added log
    return usersData;
  } catch (error) {
    console.error('[DataManager] Failed to load or parse users.json:', error.message); // Log only message
    // Re-log the full error if needed for deeper debugging, but often message is enough
    // console.error(error); 
    throw new Error(`Could not load user data. Ensure ${USERS_FILE_PATH} exists and is valid JSON.`);
  }
}

// At the end of utils/data_manager.js
/**
 * @typedef {object} UserCredentials
 * @property {string} username
 * @property {string} password
 * @property {string} description
 */

/**
 * @typedef {object} DataManagerModule
 * @property {function(string): (UserCredentials | null)} getUser - Retrieves user credentials by type.
 * @property {function(): object} loadUsers - Loads all user data.
 */

/** @type {DataManagerModule} */

module.exports = {
    getData,
    loadDataFile,
    generateNewUser,
    generateNewProduct,
    getUser,
    loadUsers
};
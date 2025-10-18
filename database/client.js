const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

let bufferObj = Buffer.from(process.env.DB_PASSWORD, "base64");
let decodedPassword = bufferObj.toString("utf8");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    decodedPassword,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
    }
);

const database = {};

fs.readdirSync(__dirname)
    .filter(file =>
        file.endsWith('.js') &&
        file !== 'client.js' &&
        !file.startsWith('.')
    )
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes);
        database[model.name] = model;
    });

Object.keys(database).forEach(modelName => {
    if (database[modelName].associate) {
        database[modelName].associate(database);
    }
});

database.sequelize = sequelize;
database.Sequelize = Sequelize;

module.exports = database;

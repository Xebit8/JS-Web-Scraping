"use strict";


const { Sequelize } = require("sequelize");
const { database, username, password } = require("./2auth.js");

const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres',
    omitNull: true,
});
module.exports = sequelize;
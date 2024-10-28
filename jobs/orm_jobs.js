"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");

const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres'
});

(async function migrateToDB() {
    try {
        await sequelize.authenticate();
        console.log("Connected successfully!");

        
    } catch (error) {
        console.error("Failed to connect to database", error);
    }
})();
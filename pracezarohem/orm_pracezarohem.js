"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");
const getPracezarohemInfo = require("./get_pracezarohem.js");

const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres',
    omitNull: true,
});

(async function migrateToDB() {
    try {
        await sequelize.authenticate();
        console.log("Connected successfully!");
        
        const Vacancy = sequelize.define(
            'pracezarohemcz',
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrementIdentity: true,
                    primaryKey: true,
                },
                title: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                employer: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                address: DataTypes.TEXT,
                salary: DataTypes.TEXT,
                link: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
            },
            {
                tableName: 'pracezarohemcz',
            }
        );

        const jobs = await getPracezarohemInfo();
        console.log("Info was successfully scraped!")

        for (let job of jobs) {
            await Vacancy.create(job);
        }

    } catch (error) {
        console.error("Failed to connect to database", error);
    }
})();
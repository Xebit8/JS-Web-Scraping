"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");
const getEasypraceInfo = require("./get_easyprace.js");

const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres',
    omitNull: true,
});

(async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[easy-prace.cz] Successfully connected to database!");
        
        const Vacancy = sequelize.define(
            'easypracecz',
            {
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
                employment_type: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                link: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
            },
            {
                tableName: 'easypracecz',
            }
        );

        const jobs = await getEasypraceInfo();
        console.log("[easy-prace.cz] Data was successfully scraped!")

        for (let job of jobs) {
            await Vacancy.create(job);
        }
        console.log("[easy-prace.cz] Data was successfully saved!")

    } catch (error) {
        console.error("[easy-prace.cz] Failed to connect to database", error);
    }
})();
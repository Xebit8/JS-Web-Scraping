"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");
const getPraceInfo = require("./get_prace.js");

const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres',
    omitNull: true,
});

(async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[prace.cz]  Successfully connected to database!");
        
        const Vacancy = sequelize.define(
            'jobscz',
            {
                title: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                employer: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
                city: DataTypes.TEXT,
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
                tableName: 'pracecz',
            }
        );

        const jobs = await getPraceInfo();
        console.log("[prace.cz] Data was successfully scraped!")

        for (let job of jobs) {
            await Vacancy.create(job);
        }
        console.log("[prace.cz] Data was successfully saved!")

    } catch (error) {
        console.error("[prace.cz] Failed to connect to database", error);
    }
})();
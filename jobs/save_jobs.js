"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");
const getJobsInfo = require("./get_jobs.js");

const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres',
    omitNull: true,
});

(async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[jobs.cz] Successfully connected to database!");
        
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
                address: DataTypes.TEXT,
                features: DataTypes.TEXT,
                link: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
            },
            {
                tableName: 'jobscz',
            }
        );

        const jobs = await getJobsInfo();
        console.log("[jobs.cz] Data was successfully scraped!")

        for (let job of jobs) {
            await Vacancy.create(job);
        }
        console.log("[jobs.cz] Data was successfully saved!")

    } catch (error) {
        console.error("[jobs.cz] Failed to connect to database", error);
    }
})();
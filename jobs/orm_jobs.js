"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");
const getJobsInfo = require("./get_jobs.js");

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
            'jobscz',
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
                features: DataTypes.TEXT,
                link: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
            },
            {
                tableName: 'jobscz',
                timestamps: false,
            }
        );

        const jobs = await getJobsInfo();
        console.log("Info was successfully scraped!")

        for (let job of jobs) {
            await Vacancy.create(job);
        }

    } catch (error) {
        console.error("Failed to connect to database", error);
    }
})();
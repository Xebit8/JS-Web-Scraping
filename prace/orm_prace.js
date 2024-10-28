"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");
const getPraceInfo = require("./get_prace.js");

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
                timestamps: false,
            }
        );

        const jobs = await getPraceInfo();
        console.log("Info was successfully scraped!")

        for (let job of jobs) {
            await Vacancy.create(job);
        }

    } catch (error) {
        console.error("Failed to connect to database", error);
    }
})();
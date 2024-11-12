"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");
const getProfesiaInfo = require("./get_profesia.js");

const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres',
    omitNull: true,
});

(async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[profesia.cz] Successfully connected to database!");
        
        const Vacancy = sequelize.define(
            'profesiacz',
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
                link: {
                    type: DataTypes.TEXT,
                    allowNull: false
                },
            },
            {
                tableName: 'profesiacz',
            }
        );

        const jobs = await getProfesiaInfo();
        console.log("[profesia.cz] Data was successfully scraped!")

        for (let job of jobs) {
            await Vacancy.create(job);
        }
        console.log("[profesia.cz] Data was successfully saved!")

    } catch (error) {
        console.error("[profesia.cz] Failed to connect to database", error);
    }
})();
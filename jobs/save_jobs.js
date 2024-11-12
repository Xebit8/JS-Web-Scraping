"use strict";


const { Sequelize, Model, DataTypes} = require("sequelize");
const { database, username, password } = require("../2auth.js");
const { CronJob, CronTime } = require("cron");
const getJobsInfo = require("./get_jobs.js");

const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres',
    omitNull: true,
});

async function saveToDatabase() {
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
        await Vacancy.sync({alter: true});

        let task_status = "Success";
        try {
            const jobs = await getJobsInfo();
            console.log("[jobs.cz] Data was successfully scraped!");

            for (let job of jobs) {
                await Vacancy.create(job);
            }
            console.log("[jobs.cz] Data was successfully saved!");
        } catch (error) {
            console.error("[jobs.cz] Failed to save data.", error);
            task_status = "Failure";
        }
        create_task(task_status);

    } catch (error) {
        console.error("[jobs.cz] Failed to connect to database.", error);
    }
}

async function create_task(task_status) {
    const Task = sequelize.define(
        "task",
        {
            website: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            status: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    isIn: [["Success", "Failure"]],
                },
            },
        }
    )
    await Task.sync({alter: true});

    await Task.create({website: "jobs.cz", status: task_status});
    console.log("[jobs.cz] The task is done!");
}

const job = CronJob.from({
    cronTime: '0 0/5 * * * *',
    onTick: () => saveToDatabase(),
    start: true,
    timeZone: 'Europe/Moscow'
});
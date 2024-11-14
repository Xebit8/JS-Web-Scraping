"use strict";


const { CronJob } = require("cron");
const sequelize = require("../general/connect.js");
const { Vacancy_Profesia, Task } = require("../general/models.js");
const getProfesiaInfo = require("./get_profesia.js");

async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[profesia.cz] Successfully connected to database!");

        let task_status = "Success";
        try {
            const jobs = await getProfesiaInfo();
            console.log("[profesia.cz] Data was successfully scraped!")

            for (let job of jobs) {
                await Vacancy_Profesia.create(job);
            }
            console.log("[profesia.cz] Data was successfully saved!");
        } catch (error) {
            console.error("[profesia.cz] Failed to connect to database.", error);
            task_status = "Failure";
        }
        create_task(task_status);

    } catch (error) {
        console.error("[profesia.cz] Failed to connect to database", error);
    }
}

async function create_task(task_status) {
    await Task.create({website: "profesia.cz", status: task_status});
    console.log("[profesia.cz] The task is done!");
}

const job = CronJob.from({
    cronTime: '0 1/5 * * * *',
    onTick: () => saveToDatabase(),
    start: true,
    timeZone: 'Europe/Moscow'
});
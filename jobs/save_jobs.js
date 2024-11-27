"use strict";


const { CronJob } = require("cron");
const sequelize = require("../general/connect.js");
const { Vacancy_Jobs, Task } = require("../general/models.js");
const getJobsInfo = require("./get_jobs.js");

async function saveToDatabase() {
    try {
        await sequelize.authenticate();
        console.log("[jobs.cz] Successfully connected to database!");

        let task_status = "Success";
        try {
            await Vacancy_Jobs.truncate({restartIdentity: true});
            console.log("[jobs.cz] All old data was successfully deleted!");

            const jobs = await getJobsInfo();
            console.log("[jobs.cz] Data was successfully scraped!");

            await Vacancy_Jobs.bulkCreate(jobs);
            console.log("[jobs.cz] New data was successfully saved!");
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
    await Task.create({website: "jobs.cz", status: task_status});
    console.log("[jobs.cz] The task is done!");
}

const job = CronJob.from({
    cronTime: '0 0/5 * * * *',
    onTick: () => saveToDatabase(),
    start: true,
    timeZone: 'Europe/Moscow'
});
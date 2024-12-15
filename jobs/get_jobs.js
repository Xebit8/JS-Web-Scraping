"use strict";

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const base_url = "https://www.jobs.cz/prace";

// Alternating userAgents (Tiny measures to bypass the blocking)
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
];
const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
const headers = {
    "User-agent": ua,
    "X-Requested-With": "XMLHttpRequest",
};

module.exports = async function getJobsInfo() {
    try {
        const jobsData = await scrapPage(base_url);
        await fs.writeFile("jobs/analysis_result.txt", analyzeData(jobsData));

        return jobsData;

    } catch (error) {
        console.error(error);
    }
}

async function scrapPage(base_url) {
    try {
        let counter = 1;
        let hasMorePages = true;
        let jobsData = [];
        
        // Delay time function
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms * 1000));
        
        // Scraping data on each page
        while (hasMorePages) {
            console.log(counter);

            await delay(2); // Wait before request to lessen suspicion

            const response = await axios.get(`${base_url}?page=${counter}`, { headers });

            const $ = cheerio.load(response.data);

            const $vacTitle = $(".SearchResultCard__titleLink");

            // Checking if pages are duplicated
            if (jobsData.length > 0 && $vacTitle.eq(-1).text().trim() === jobsData.at(-1)["title"]) {
                hasMorePages = false;
                break;
            }

            const $vacEmployer = $(".SearchResultCard__footerItem");
            const $vacAddress = $("li[data-test=serp-locality]");
            const $vacFeatures = $(".SearchResultCard__body > .Tag");
            const $vacLink = $(".SearchResultCard__titleLink");

            // Bringing data to proper form and pushing it
            for (let i = 0; i < $vacTitle.length; i++) {
                jobsData.push({
                    title: $vacTitle.eq(i).text().trim(),
                    employer: $vacEmployer.eq(i).text().trim(),
                    address: $vacAddress.eq(i).text().trim(),
                    features: $vacFeatures.eq(i).text().trim(),
                    link: $vacLink.eq(i).attr('href'),
                });
            }

            counter++;
        }

        return jobsData;
    } catch (error) {
        console.error(error);
    }
}

function analyzeData(jobsData) {
    let msg = "";
    const totalJobs = jobsData.length;
    const attrNames = ["title", "employer", "address", "features"]; // No need to analyze links column

    // Building statistics for each column
    attrNames.forEach(attr => {
        let wordCounts = [];
        let uniqueWords = new Set();
        let missingCount = 0;

        jobsData.forEach(job => {
            const value = job[attr];
            if (!value) {
                missingCount++;
            } else {
                const words = value.split(/\s+/);
                wordCounts.push(words.length);
                words.forEach(word => uniqueWords.add(word));
            }
        });

        const minWords = Math.min(...wordCounts);
        const maxWords = Math.max(...wordCounts);
        const avgWords = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
        const uniqueWordCount = uniqueWords.size;
        const missingRatio = missingCount / totalJobs;

        msg +=  `Атрибут: ${attr}`+
                `\nОбщее количество: ${totalJobs}`+
                `\nМинимум слов: ${minWords}`+
                `\nМаксимум слов: ${maxWords}`+
                `\nСреднее количество слов: ${avgWords.toFixed(2)}`+
                `\nКоличество уникальных слов: ${uniqueWordCount}`+
                `\nДоля пропусков: ${(missingRatio * 100).toFixed(2)}%`+
                `\n-----------------------------------\n`;
    });
    return msg;
}



"use strict";

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const base_url = "https://www.jobs.cz/prace";
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 7_0_2) Gecko/20100101 Firefox/53",
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows; Windows NT 6.1; WOW64 Trident/5.0)",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; x64; en-US) Gecko/20100101 Firefox/62.3",
    "Mozilla/5.0 (Windows; U; Windows NT 10.0; Win64; x64; en-US) AppleWebKit/537.32 (KHTML, like Gecko) Chrome/48.0.3931.209 Safari/536.4 Edge/13.26854",
    "Mozilla/5.0 (compatible; MSIE 7.0; Windows NT 6.0;; en-US Trident/4.0)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 7_8_2; en-US) Gecko/20100101 Firefox/65.2",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_8_5; like Mac OS X) AppleWebKit/537.24 (KHTML, like Gecko) Chrome/52.0.3825.262 Mobile Safari/535.2",
    "Mozilla/5.0 (Linux; Linux i652 ) AppleWebKit/600.30 (KHTML, like Gecko) Chrome/54.0.2777.319 Safari/600",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 9_2_5; like Mac OS X) AppleWebKit/601.6 (KHTML, like Gecko) Chrome/50.0.3355.226 Mobile Safari/537.3",
    "Mozilla/5.0 (Android; Android 5.0; SM-G400 Build/LRX22C) AppleWebKit/537.48 (KHTML, like Gecko) Chrome/51.0.1416.156 Mobile Safari/533.9",
];
const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
const headers = {
    "User-agent": ua,
    "X-Requested-With": "XMLHttpRequest",
};

(async function getJobsInfo() {
    try {
        const jobsData = await scrapPage(base_url);

        await fs.writeFile("jobs/clean_response.json", JSON.stringify(jobsData, null, 4));

        analyzeData(jobsData);

    } catch (error) {
        console.error(error);
    }
})();

async function scrapPage(base_url) {
    try {
        let counter = 1;
        let hasMorePages = true;
        let jobsData = [];
        
        // Scraping data on each page
        while (hasMorePages) {
            console.log(counter);
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

            // Bringing data to proper form and pushing it
            for (let i = 0; i < $vacTitle.length; i++) {
                jobsData.push({
                    title: $vacTitle.eq(i).text().trim(),
                    employer: $vacEmployer.eq(i).text().trim(),
                    address: $vacAddress.eq(i).text().trim(),
                    features: $vacFeatures.eq(i).text().trim()
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
    const totalJobs = jobsData.length;
    const attrNames = ["title", "employer", "address", "features"];

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

        console.log(`Атрибут: ${attr}`);
        console.log(`Общее количество: ${totalJobs}`);
        console.log(`Минимум слов: ${minWords}`);
        console.log(`Максимум слов: ${maxWords}`);
        console.log(`Среднее количество слов: ${avgWords.toFixed(2)}`);
        console.log(`Количество уникальных слов: ${uniqueWordCount}`);
        console.log(`Доля пропусков: ${(missingRatio * 100).toFixed(2)}%`);
        console.log('-----------------------------------');
    });
}

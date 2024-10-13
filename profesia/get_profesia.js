"use strict";


const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const base_url = "https://www.profesia.cz/prace";

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
};

(async function getProfesiaInfo()
{
    try
    {
        const profesiaData = await scrapPage(base_url);

        await fs.writeFile("profesia/clean_response.json", JSON.stringify(profesiaData, null, 4));

        analyzeData(profesiaData);


    } catch(error)
    {
        console.error(error);
    }
})();
async function scrapPage(base_url) {
    try {
        let counter = 1;
        let hasMorePages = true;
        let profesiaData = [];

        // Scraping data on each page
        while (hasMorePages) {
            console.log(counter);
            const response = await axios.get(`${base_url}?page_num=${counter}`, { headers });

            const $ = cheerio.load(response.data);

            const $vacTitle = $(".title");
            console.log($vacTitle.length);
            console.log($vacTitle.eq(-1).text());
            if (profesiaData.length > 0) console.log(profesiaData.at(-1)["title"])

            // Check if there are vacancies to be scraped on page
            if ($vacTitle.length === 0) {
                hasMorePages = false;
                break;
            }

            const $vacEmployer = $(".employer");
            const $vacAddress = $(".job-location");
            const $vacSalary = $(".label");

            // Bringing data to proper form and pushing it
            for (let i = 0; i < $vacTitle.length; i++) {
                profesiaData.push({
                    title: $vacTitle.eq(i).text(),
                    employer: $vacEmployer.eq(i).text(),
                    address: $vacAddress.eq(i).text(),
                    salary: $vacSalary.eq(i).text().trim(),
                });
            }
            counter++;
        }
        return profesiaData;

    } catch (error) {
        console.error(error);
    }
}
function analyzeData(profesiaData) {
    const totalPrace = profesiaData.length;
    const attrNames = ["title", "employer", "address", "salary"];

    // Building statistics for each column
    attrNames.forEach(attr => {
        let wordCounts = [];
        let uniqueWords = new Set();
        let missingCount = 0;

        profesiaData.forEach(job => {
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
        const missingRatio = missingCount / totalPrace;

        console.log(`Атрибут: ${attr}`);
        console.log(`Общее количество: ${totalPrace}`);
        console.log(`Минимум слов: ${minWords}`);
        console.log(`Максимум слов: ${maxWords}`);
        console.log(`Среднее количество слов: ${avgWords.toFixed(2)}`);
        console.log(`Количество уникальных слов: ${uniqueWordCount}`);
        console.log(`Доля пропусков: ${(missingRatio * 100).toFixed(2)}%`);
        console.log('-----------------------------------');
    });
}
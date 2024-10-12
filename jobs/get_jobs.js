"use strict";


const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

//const base_url = "https://www.jobs.cz/api/search/no-user-input/recommended?lang=cs";
const base_url = "https://www.jobs.cz/prace"

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
];
const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
const headers = {
    "User-agent": ua,
    "X-Requested-With": "XMLHttpRequest",
};

(async function getJobsInfo()
{
    try
    {
        await scrapPage(base_url);

        const filedResponse = await fs.readFile("jobs/response.txt", "utf-8");

        const $ = cheerio.load(filedResponse);

        const $vacTitle = $(".SearchResultCard__titleLink");
        const $vacEmployer = $("SearchResultCard__footerItem");
        const $vacAddress = $("li[data-test=serp-locality]");
        const $vacFeatures = $(".SearchResultCard__body > .Tag");

        let vacQuantity = $vacTitle.length;
        
        let vacTitleString = `${$vacTitle.eq(0).text().trim()}`;
        let vacEmployerString = `${$vacTitle.eq(0).text().trim()}`;
        let vacAddressString = `${$vacTitle.eq(0).text().trim()}`;
        let vacFeaturesString = `${$vacTitle.eq(0).text().trim()}`;

        for (let i = 1; i < vacQuantity; i++)
        {
            vacTitleString += `;` + $vacTitle.eq(i).text().trim();
            vacEmployerString += `;` + $vacEmployer.eq(i).text().trim();
            vacAddressString += `;` + $vacAddress.eq(i).text().trim();
            vacFeaturesString += `;` + $vacFeatures.eq(i).text().trim();
        }
        //console.log(vacTitleString);
        //console.log(vacEmployerString);
        //console.log(vacAddressString);
        //console.log(vacFeaturesString);

        await fs.writeFile("clean_response.json", JSON.stringify({
            title: vacTitleString,
            employer: vacEmployerString,
            address: vacAddressString,
            features: vacFeaturesString
        }, null, 4));

    } catch(error)
    {
        console.error(error);
    }
})();

async function scrapPage(base_url) {
    try {
        let counter = 1;
        let hasMorePages = true;
        while (hasMorePages) {
            const response = await axios.get(`${base_url}?page=${counter}`, {headers});
            if (!response.data || response.data.length === 0)
            {
                hasMorePages = false;
                break;
            }
            await fs.appendFile("jobs/response.txt", response.data);
            counter++;
        }
    } catch (error) {
        ;
    }
}
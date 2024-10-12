"use strict";


const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const base_url = "https://www.easy-prace.cz/nabidka-zamestnani/";

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
];
const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
const headers = {
    "User-agent": ua,
};

(async function getEasyPraceInfo()
{
    try
    {
        let response = await axios.get(base_url, {headers}).then(({ data }) => { return data; });
        console.log(response);

        const $ = cheerio.load(response.data);

        const vacTitle = $(".nabidkaItem-title").title();
        const vacEmployer = $(".nabidkaItem-infoRow > a").text();
        const vacAddress = $(".nabidkaItem-infoRow").text();
        const vacIncome = $(".label-success").text();
        const vacEmploymentType = $(".nabidkaItem-infoRow")[2].text();

    } catch(error)
    {
        console.error(error);
    }
})();
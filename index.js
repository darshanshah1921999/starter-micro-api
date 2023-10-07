const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;
const url = 'https://in.bookmyshow.com/sports/india-vs-pakistan-icc-mens-cwc-2023/ET00367559?groupEventCode=ET00367204';
let lastSentTimestamp1 = Date.now();
let lastSentTimestamp = Date.now();

async function sendWhatsapp(message) {
    try {
        console.info(`In sendWhatsapp`);
        const accountSid = process.env.ACCOUNT_SID;
        const authToken = process.env.AUTH_TOKEN;
        const client = require('twilio')(accountSid, authToken);

        client.messages
            .create({
                body: message,
                from: 'whatsapp:+' + process.env.FROM,
                to: 'whatsapp:+' + process.env.TO_1
            })
        client.messages
            .create({
                body: message,
                from: 'whatsapp:+' + process.env.FROM,
                to: 'whatsapp:+' + process.env.TO_2
            })
        client.messages
            .create({
                body: message,
                from: 'whatsapp:+' + process.env.FROM,
                to: 'whatsapp:+' + process.env.TO_3
            })

        console.log('message sent:');
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function isMessageSentRecently() {
    try {
        const timestamp = lastSentTimestamp;
        const currentTime = Date.now();
        const timeDifference = currentTime - timestamp;

        return timeDifference < 60 * 60 * 1000; 
    } catch (error) {
        return false;
    }
}

function isMessageNotSentRecently() {
    try {
        const timestamp = lastSentTimestamp1;
        const currentTime = Date.now();
        const timeDifference = currentTime - timestamp;

        return timeDifference < 24 * 60 * 60 * 1000; 
    } catch (error) {
        return false;
    }
}

function updateLastSentTimestamp() {
    lastSentTimestamp = Date.now();
}

function updateLastSentTimestamp1() {
    lastSentTimestamp1 = Date.now();
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
    res.status(200).send("App is up!");
})

app.get('/check', async (req, res) => {
    console.log('Received a GET request to /check:', new Date());
    await checkForTickets(res);
});

async function checkForTickets(res) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);
    const elementIdToCheck = '#synopsis-coming-soon-button';
    try {
        await page.waitForSelector(elementIdToCheck, { timeout: 10000 });
        if (!isMessageNotSentRecently()) {
            sendWhatsapp('Tickets are not available yet');
            updateLastSentTimestamp1();
        }
        console.log(`Element with ID '${elementIdToCheck}' is present on the page.`);
        res.status(200).send('Checked. Tickets not available yet.');
    } catch (error) {
        if (!isMessageSentRecently()) {
            sendWhatsapp('Ticket available - Buy 4 Tickets - ' + url);
            console.error(`Element with ID '${elementIdToCheck}' is not present on the page.`);
            updateLastSentTimestamp();
        }
        res.status(200).send('Checked. Tickets available. Message sent.');
    } finally {
        await browser.close();
    }
}



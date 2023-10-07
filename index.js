var http = require('http');
const puppeteer = require('puppeteer');
const cron = require('node-cron');

http.createServer(function (req, res) {
    console.log(`Just got a request at ${req.url}!`)
    res.write('Yo!');
    res.end();
}).listen(process.env.PORT || 3000);

const url = 'https://in.bookmyshow.com/sports/india-vs-pakistan-icc-mens-cwc-2023/ET00367559?groupEventCode=ET00367204';
let lastSentTimestamp1 = 1696494856000;
let lastSentTimestamp = Date.now();

// Function to send an email
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

// Function to check if a message was sent within the last 60 minutes
function isMessageSentRecently() {
    // Read the last sent timestamp from a file (if it exists)
    try {
      const timestamp = lastSentTimestamp;
      const currentTime = Date.now();
      const timeDifference = currentTime - timestamp;
  
      // Return true if the message was sent within the last 60 minutes
      return timeDifference < 60 * 60 * 1000; // 60 minutes in milliseconds
    } catch (error) {
      // If the file doesn't exist or there's an error, return false
      return false;
    }
  }

  function isMessageNotSentRecently() {
    // Read the last sent timestamp from a file (if it exists)
    try {
      const timestamp = lastSentTimestamp1;
      const currentTime = Date.now();
      const timeDifference = currentTime - timestamp;
  
      // Return true if the message was sent within the last 60 minutes
      return timeDifference < 24 * 60 * 60 * 1000; // 60 minutes in milliseconds
    } catch (error) {
      // If the file doesn't exist or there's an error, return false
      return false;
    }
  }
  
  // Function to update the last sent timestamp
  function updateLastSentTimestamp() {
    lastSentTimestamp = Date.now();
  }

  function updateLastSentTimestamp1() {
    lastSentTimestamp1 = Date.now();
  }

cron.schedule('*/ * * * *', async () => {
    console.log("cron triggerd", Date.now())
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);

    // Define the ID of the element you want to check
    const elementIdToCheck = '#synopsis-coming-soon-button'; // Replace with the actual ID

    try {
        // Wait for the element to appear with a timeout of 10 seconds (adjust as needed)
        await page.waitForSelector(elementIdToCheck, { timeout: 10000 });
        if (!isMessageNotSentRecently()) {
            sendWhatsapp('Tickets are not available yet');
            updateLastSentTimestamp1();
        }

        // If the element is found, log a success message
        console.log(`Element with ID '${elementIdToCheck}' is present on the page.`);
    } catch (error) {
        if (!isMessageSentRecently()) {
            sendWhatsapp('Ticket available - Buy 4 Tickets - ' + url);
            // If the element is not found within the timeout, log an error message
            console.error(`Element with ID '${elementIdToCheck}' is not present on the page.`);
            updateLastSentTimestamp();
        }
    }

    await browser.close();
});


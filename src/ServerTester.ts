import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { MessageContainer, serverPort } from './Globals';
import { get } from 'http';
import { start } from 'repl';

// get the command line arguments


const baseURL = `http://localhost:${serverPort}`;

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.error('Usage: node ServerTester serverURL[http://localhost:5800]');
    console.log(`using default serverURL: ${baseURL}`);
}


async function pingServer() {
    const url = `${baseURL}/ping`;
    const result = await axios.get(url);
    if (result.status !== 200) {
        return false;
    }
    return true;
}



async function resetTestData() {
    const url = `${baseURL}/reset`;
    return await axios.get(url);
}

async function sendTestMessage(message: string, user: string) {
    const url = `${baseURL}/message/${user}/${message}}`;
    return await axios.get(url);
}

async function getMessages(pagingToken: string) {
    const url = `${baseURL}/messages/get/${pagingToken}`;
    const result = await axios.get(url);
    if (result.status !== 200) {
        return null;
    }
    return result.data as MessageContainer;
}



async function testSendMessages() {
    const messages = [
        'Hello World',
        'This is a test',
        'This is a test of the emergency broadcast system',
        'This is only a test',
        'Had this been an actual emergency',
        'You would have been instructed',
        'Where to tune in your area',
        'This concludes this test of the emergency broadcast system'
    ];
    const users = [
        'Jose',
        'Bob',
        'Sally',
        'Jane',
        'Joe',
        'John',
        'Mary',
        'Sue'
    ];

    const promises: Promise<any>[] = [];
    for (let i = 0; i < 100; i++) {
        const message = messages[Math.floor(Math.random() * messages.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        promises.push(sendTestMessage(message, user));
    }

    return Promise.all(promises);
}

async function testGetMessages(startToken: number | undefined = undefined, expectedCount: number) {
    let paginationToken = '';
    if (startToken !== undefined) {
        paginationToken = `__${startToken.toString().padStart(10, '0')}__`;
    }


    let numberOfMessages = 0;
    let messages = await getMessages(paginationToken);

    if (!messages) {
        console.error('Error getting messages');
        return;
    }

    while (messages.paginationToken !== '__END__') {
        numberOfMessages += messages.messages.length;
        paginationToken = messages.paginationToken;
        messages = await getMessages(paginationToken);
        if (!messages) {
            console.error('Error getting messages');
            return;
        }
    }

    // add the last set of messages
    numberOfMessages += messages.messages.length;

    if (numberOfMessages !== expectedCount) {
        console.error(`Error: expected ${expectedCount} messages, but got ${numberOfMessages}`);
        return;
    }
    console.log(`Success: got ${numberOfMessages} messages`)


}

if (!pingServer()) {
    console.error(`Server not running at ${baseURL}`);
    process.exit(1);
} else {
    console.log(`Server running at ${baseURL}`);
}

resetTestData();
testSendMessages();

testGetMessages(undefined, 100);
testGetMessages(3, 4);
testGetMessages(1000, 0);

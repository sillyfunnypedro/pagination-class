import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { MessagesContainer, MessageContainer, serverPort } from './Globals';
import { get } from 'http';
import { start } from 'repl';
import { send } from 'process';

// get the command line arguments


let baseURL = `http://localhost:${serverPort}`;

const args = process.argv.slice(2);

if (args.length === 1) {
    baseURL = args[0];
}
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
    const url = `${baseURL}/message/${user}/${message}`;
    return await axios.get(url);
}

async function getMessages(pagingToken: string) {
    const url = `${baseURL}/messages/get/${pagingToken}`;
    const result = await axios.get(url);
    if (result.status !== 200) {
        return null;
    }
    return result.data as MessagesContainer;
}



async function testSendMessages(numberOfMessages: number) {
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
    for (let i = 0; i < numberOfMessages; i++) {
        const message = messages[Math.floor(Math.random() * messages.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        promises.push(sendTestMessage(message, user));
    }

    return Promise.all(promises);
}



async function testGetMessages(testName: string, startToken: number | undefined = undefined): Promise<MessagesContainer | undefined> {
    let paginationToken = '';

    let messagesFound: MessageContainer[] = []
    let messagesPackage: MessagesContainer | null = null;





    messagesPackage = await getMessages(paginationToken);


    if (!messagesPackage) {
        console.error('Error getting messages');
        return;
    }

    return messagesPackage;
}

if (!pingServer()) {
    console.error(`Server not running at ${baseURL}`);
    process.exit(1);
} else {
    console.log(`Server running at ${baseURL}`);
}




async function runTests() {
    await resetTestData();
    let foundMessages = await testGetMessages("Fetching Empty Database", undefined);
    console.log(foundMessages);

    // test foundMessages

    await testSendMessages(1);

    foundMessages = await testGetMessages("Fetching one message Database", undefined);
    console.log(foundMessages);

    await resetTestData();

    // send 10 messages and then get a fetch to see if you got 10 messages.

    // send 11 messages and then fetch them in two steps and see if you got 11 messages.

    // send 201 messages and then fetch them in 21 steps and see if you got 201 messages

}

runTests();

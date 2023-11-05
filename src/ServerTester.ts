import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { MessagesContainer, MessageContainer, serverPort } from './Globals';
import { get } from 'http';
import { start } from 'repl';
import { send } from 'process';

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

async function testGetMessages(testName: string, startToken: number | undefined = undefined, expectedCount: number): Promise<MessageContainer[] | undefined> {
    let paginationToken = '';
    if (startToken !== undefined) {
        paginationToken = `__${startToken.toString().padStart(10, '0')}__`;
    }

    let messagesFound: MessageContainer[] = []
    let messagesPackage: MessagesContainer | null = null;
    let numberOfMessages = 0;




    while (paginationToken !== '__END__') {
        messagesPackage = await getMessages(paginationToken);


        if (!messagesPackage) {
            console.error('Error getting messages');
            return;
        }

        paginationToken = messagesPackage!.paginationToken;
        let messages = messagesPackage!.messages;
        numberOfMessages += messages.length;
        messagesFound.push(...messages);
    }



    console.log('*'.repeat(80) + '\n');
    console.log(`Test: ${testName}`);
    console.log(`Expected: ${expectedCount} messages`);
    if (numberOfMessages !== expectedCount) {
        console.error(`Error: expected ${expectedCount} messages, but got ${numberOfMessages}`);
        return;
    }
    console.log(`Success: got ${numberOfMessages} messages`)
    console.log('\n' + '*'.repeat(80));

    return messagesFound;
}

if (!pingServer()) {
    console.error(`Server not running at ${baseURL}`);
    process.exit(1);
} else {
    console.log(`Server running at ${baseURL}`);
}




async function runTests() {
    await resetTestData();
    let foundMessages = await testGetMessages("Fetching Empty Database", undefined, 0);
    console.log(foundMessages);

    await testSendMessages(1);

    foundMessages = await testGetMessages("Fetching one message Database", undefined, 1);
    console.log(foundMessages);
    await testGetMessages("Fetching one message star 0", 0, 1);


    await resetTestData();

    // send 100 messages
    await testSendMessages(100);
    foundMessages = await testGetMessages("fetching all, expect 100", undefined, 100);
    // check that the ID of the messages are in the right order
    for (let i = 0; i < foundMessages!.length; i++) {
        const expectedID = foundMessages!.length - i - 1;
        const foundID = foundMessages![i].id;
        if (foundID !== expectedID)
            console.error(`Error: expected message ${i} to have id ${expectedID} but got ${foundMessages![i].id}`);
    }
    foundMessages = await testGetMessages("fetching 4 messages", 3, 4);
    foundMessages = await testGetMessages("Fetching out of range", 1000, 0);

    await sendTestMessage('Hello World', 'Jose');
    foundMessages = await testGetMessages("fetching all expect 101", undefined, 101);
    const lastMessage = foundMessages![0];
    if (lastMessage.user !== 'Jose') {
        console.error(`Error: expected last message to be from Jose, but got ${lastMessage.user}`);
    }
    if (lastMessage.message !== 'Hello World') {
        console.error(`Error: expected last message to be 'Hello World', but got ${lastMessage.message}`);
    }
    if (lastMessage.id !== 100) {
        console.error(`Error: expected last message to have id 100, but got ${lastMessage.id}`);
    }




}

runTests();

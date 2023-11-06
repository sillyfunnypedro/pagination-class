/**
 * ChatClient
 * 
 * @export
 * 
 */

import { MessagesContainer, MessageContainer } from "./Globals";



class ChatClient {

    earliestMessageID: number = 10000000000;

    messages: MessageContainer[] = [];

    updateDisplay: () => void = () => { };
    /**
     * Creates an instance of ChatClient.
     * @memberof ChatClient
     */
    constructor() {
        console.log("ChatClient");
        this.getMessagesContinuously();
    }

    setCallback(callback: () => void) {
        this.updateDisplay = callback;
    }


    insertMessage(message: MessageContainer) {
        const messageID = message.id;

        if (this.earliestMessageID > messageID) {
            this.earliestMessageID = messageID;

        }

        if (this.messages.length === 0) {
            this.messages.push(message);
            console.log(`inserted message ${messageID} into empty array`)
            return;
        }

        if (messageID > this.messages[0].id) {
            this.messages.unshift(message);
            console.log(`inserted message ${messageID} at the beginning of the array`)
            return;
        }

        if (messageID < this.messages[this.messages.length - 1].id) {
            this.messages.push(message);
            console.log(`inserted message ${messageID} at the end of the array`)
            return;
        }
        // console.log(`Message is not inserted ${messageID}`)
    }

    insertMessages(messages: MessageContainer[]) {
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            this.insertMessage(message);

        }
        this.updateDisplay();
    }

    /** 
     * get the last 10 messages from the server if the paging token is empty
     * get the next 10 messages from the server if the paging token is not empty
     */
    getMessages(pagingToken: string = '') {

        const url = `http://localhost:5800/messages/get/`;
        //const url = `https://pagination-demo.onrender.com/messages/get`

        const fetchURL = `${url}${pagingToken}`;
        fetch(fetchURL)
            .then(response => response.json())
            .then((messagesContainer: MessagesContainer) => {
                let messages = messagesContainer.messages;
                this.insertMessages(messages);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * get the messages once a second
     */
    getMessagesContinuously() {
        console.log("getMessagesContinuously()");
        setInterval(() => {
            this.getMessages();
        }, 1000);

    }

    getNextMessages() {
        console.log("getNextMessages()");
        console.log(`this.earliestMessageID: ${this.earliestMessageID}`);
        const pagingToken = `__${this.earliestMessageID.toString().padStart(10, '0')}__`;
        this.getMessages(pagingToken);
    }

    sendMessage(message: string, user: string) {
        console.log("sentMessage()");
        const url = `http://localhost:5800/message/${user}/${message}`;
        //const url = `https://pagination-demo.onrender.com/message/${user}/${message}`

        fetch(url)
            .then(response => response.json())
            .then((messagesContainer: MessagesContainer) => {
                let messages = messagesContainer.messages;
                this.insertMessages(messages);
            })
            .catch((error) => {
                console.error(error);
            });
    }





}

export default ChatClient;
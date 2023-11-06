import React, { useState, useEffect, useCallback } from "react";

import { MessageContainer } from "./Globals";

import ChatClient from "./ChatClient";
import './Styles.css'
import e from "express";





const chatClient = new ChatClient();


function ChatComponent() {
    const [messages, setMessages] = useState<MessageContainer[]>([]);
    const [mostRecentId, setMostRecentId] = useState<number>(0);
    const [user, setUser] = useState<string>("Jose");
    const [message, setMessage] = useState<string>("Hello World");

    let localUser = user;
    let localMessage = message;
    const updateDisplay = useCallback(() => {
        // check to see if we need to update
        const newLastId = chatClient.messages[0].id;
        if (newLastId === mostRecentId) {
            return;
        }
        setMessages(chatClient.messages);
        setMostRecentId(newLastId);
    }, []);

    useEffect(() => {
        chatClient.setCallback(updateDisplay);
    }, [updateDisplay]);


    function makeFormatedMessages() {
        let formatedMessages = [...messages].reverse().map((message, index) => (
            <textarea key={index} readOnly value={message.user + ": " + message.message} />
        ));
        return formatedMessages;
    }

    return (
        <div>
            <h1>Chat Component</h1>
            <div className="scrollable-text-view">
                {makeFormatedMessages()}
            </div>
            <input
                type="text"
                id="user"
                placeholder={user}
                onKeyUp={(event) => {
                    localUser = event.currentTarget.value;
                    setUser(localUser);
                }}
            />
            <input
                type="text"
                id="message"
                placeholder={message}
                onKeyUp={(event) => {
                    localMessage = event.currentTarget.value;
                    setMessage(event.currentTarget.value);
                    if (event.key === "Enter") {
                        chatClient.sendMessage(localUser, localMessage);
                        // clear the message
                        event.currentTarget.value = "";
                        setMessage("");
                    }
                }}
            />

            <button onClick={() => chatClient.sendMessage(localUser, localMessage)}>Send</button>
        </div>
    );
}

export default ChatComponent;

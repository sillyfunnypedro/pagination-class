
import { describe, expect, test } from '@jest/globals';
import { Database, Message } from './Database';
import { MessagesContainer, MessageContainer } from './Globals';
import { get } from 'http';




describe('Database', () => {

    let userJose = "Jose";
    let userMaria = "Maria";
    let userJuan = "Juan";
    let userPedro = "Pedro";



    test('addMessage', () => {
        let db = new Database();
        const messageText = 'Hello, world!';
        db.addMessage(userJose, messageText);
        const messages = db.getMessages('');
        const message0 = messages.messages[0];

        expect(message0.user).toBe(userJose);
    });

    test('getMessages 10', () => {
        let db = new Database();
        for (let i = 0; i < 10; i++) {
            db.addMessage(userJose, `Message ${i}`);
        }

        let messages = db.getMessages('');
        const paginationToken = messages.paginationToken;
        expect(paginationToken).toBe("__END__");
        expect(messages.messages.length).toBe(10);

    });

    test('getMessages 15', () => {
        let db = new Database();
        for (let i = 0; i < 15; i++) {
            db.addMessage(userJose, `Message ${i}`);
        }

        let messages = db.getMessages('');
        const paginationToken = messages.paginationToken;
        expect(paginationToken).toBe("__0000000004__");
        expect(messages.messages.length).toBe(10);


        messages = db.getMessages(messages.paginationToken);
        expect(messages.messages.length).toBe(5);
        expect(messages.paginationToken).toBe("__END__");
    });
    test('getMessages 20', () => {
        let db = new Database();
        for (let i = 0; i < 20; i++) {
            db.addMessage(userJose, `Message ${i}`);
        }

        let messages = db.getMessages('');
        const paginationToken = messages.paginationToken;
        expect(paginationToken).toBe("__0000000009__");
        expect(messages.messages.length).toBe(10);


        messages = db.getMessages(messages.paginationToken);
        expect(messages.messages.length).toBe(10);
        expect(messages.paginationToken).toBe("__END__");
    });

    test('getMessages 25', () => {
        let db = new Database();
        for (let i = 0; i < 25; i++) {
            db.addMessage(userJose, `Message ${i}`);
        }

        let messages = db.getMessages('');
        const paginationToken = messages.paginationToken;
        expect(paginationToken).toBe("__0000000014__");
        expect(messages.messages.length).toBe(10);


        messages = db.getMessages(messages.paginationToken);
        expect(messages.messages.length).toBe(10);
        expect(messages.paginationToken).toBe("__0000000004__");

        messages = db.getMessages(messages.paginationToken);
        expect(messages.messages.length).toBe(5);
        expect(messages.paginationToken).toBe("__END__");
    });

    test('getMessages 25 +1', () => {
        let db = new Database();
        for (let i = 0; i < 25; i++) {
            db.addMessage(userJose, `Message ${i}`);
        }

        let messages = db.getMessages('');
        expect(messages.paginationToken).toBe("__0000000014__");
        expect(messages.messages.length).toBe(10);

        db.addMessage(userJose, `Message Well hello there!`);

        let otherMessages = db.getMessages('');
        expect(otherMessages.messages.length).toBe(10);
        expect(otherMessages.paginationToken).toBe("__0000000015__");


        // Use the old pagination Token it should still work and give me 0004 as the result
        messages = db.getMessages(messages.paginationToken);
        expect(messages.messages.length).toBe(10);
        expect(messages.paginationToken).toBe("__0000000004__");

        db.addMessage(userJose, `Message Well hello there! Again!`);

        messages = db.getMessages(messages.paginationToken);
        expect(messages.messages.length).toBe(5);
        expect(messages.paginationToken).toBe("__END__");

        otherMessages = db.getMessages('');
        expect(otherMessages.messages.length).toBe(10);
        expect(otherMessages.paginationToken).toBe("__0000000016__");


    });

});

/** 
 * express server to serve the app.  paths for this are
 * /api/ - api routes
 * 
 * /reset - resets the database
 * 

 * /message/send
 * 
 * /messages/get/
 */
export { };
import express from 'express';
import { Database } from './Database';
import { start } from 'repl';




const database = new Database();



const app = express();
app.use(express.json());


app.get('/message/:message', (req, res) => {
    const message = req.params.message;
    database.addMessage('Jose', message);
    const result = database.getMessages('');
    return res.json(result);
});

app.get('/', (req, res) => {
    const result = database.getMessages('');
    return res.json(result);
});


app.listen(3000, () => {
    console.log('Server listening on port 3000!');
});



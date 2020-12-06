const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());

const PORT = 3000;

const secretKey = 'My super secret key';

let users = [
    {
        id: 1,
        username: 'fabio',
        password: '123'
    },
    {
        id: 2,
        username: 'nolasco',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    for (let user of users) {
        if (username == user.username && password == user.password) {
            let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d' });
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
        else {
            res.status(401).json({
                success: false,
                token: null,
                err: 'Username or password is incorrect'
            });
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
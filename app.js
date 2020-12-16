const express = require('express');
const mysql = require('mysql');

const app = express();

const path = require('path');

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

const secretKey = 'My super secret key';
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(__dirname + '/public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'final-login'
});

db.connect( (error) => {
    if(error) {
        console.log(error);
    } else {
        console.log("MySQL Connected...")
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Username: ' + username)

        if( !username || !password ) {
            console.log('Failed Here 1');
            res.status(400).json({
                success: false,
                err: 'Please enter username and password.'
            });
        } else {
            db.query('SELECT * FROM users WHERE name = ?', [username], async (error, results) => {
            if(!results || await password != results[0].password) {
                console.log('Failed Here 2');
                res.status(401).json({
                    success: false,
                    err: 'Username or password is incorrect'
                });
            } else {
                console.log('Got Here 3');
                const id = results[0].id;
                const token = jwt.sign({ id }, secretKey, { expiresIn: '7d' });
                console.log('Got Here 4');
                res.status(200).json({
                    success: true,
                    err: null,
                    token
                });
                console.log('Got Here 5');
            }
        })}

        
    } catch (error) {
        console.log(error);
    }
    
});

app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    console.log(email)
    db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
        if(error) {
            console.log(error);
            return;
            //db.end;
        } else if (results.length > 0) {
            res.status(400).json({
                success: false,
                err: 'Email has already been registered.'
            });
            console.log(res);
            console.log('Email has already been registered');
            return;         
            //db.end;
        } else {
    db.query('SELECT name FROM users WHERE name = ?', [username], (error, results) => {
        if(error) {
            console.log(error);
            //db.end;
        } else if (results.length > 0) {
            res.status(400).json({
                success: false,
                err: 'Username has already been registered.'
            });
            console.log(res);
            console.log('Username has already been registered');        
            //db.end;
        } else {
        //db.end;
        db.query('INSERT INTO users SET ?', {name: username, email: email, password: password}, (error, results) => {
            if(error) {
                console.log(error);
            } else {
                res.json({
                    success: true,
                    err: null
                });
                console.log("User Registered");
            }
        })
        //db.end;
        console.log("State: " +  db.state)
    }
    
});
        }
        });

return res;

});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'You must be logged in to view this page'
        });
    }
    else {
        next(err);
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000")
});

//THIS WORKS
// app.post('/api/register', async (req, res) => {
//     const { username, email, password } = req.body;
//     console.log(email)
//     db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
//         if(error) {
//             console.log(error);
//             return res.status(400).render({
//                 message: 'Error'
//             })
//             //db.end;
//         } else if (results.length > 0) {
//             console.log('Email has already been registered');
//             return res.status(400).send('/api/register');           
//             //db.end;
//         } else {
//             //db.end;
//             db.query('INSERT INTO users SET ?', {name: username, email: email, password: password}, (error, results) => {
//                 if(error) {
//                     console.log(error);
//                 } else {
//                     console.log("User Registered");
//                 }
//             })
//             //db.end;
//             console.log("State: " +  db.state)
//         }
//     })
// return;
// });
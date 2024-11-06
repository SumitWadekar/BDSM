import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"
import cors from 'cors'
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors({
    origin: "*",
}))
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
//
const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});
//
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error('ERROR: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set in .env file');
    process.exit(1);
}
/*
const users = [{
    username: "Jai",
    password: "hello",
}, {
    username: "Sumit",
    password: "hello",
}];
*/
app.post('/signup', async (req, res) => {
    try {
        const { username, password, email, address } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        //const user = users.find(u => u.username === username && u.password === password);
        const [rows] = await connection.query(
            'SELECT * FROM customerinfo WHERE username = ?',
            [username]
        );
        if (rows.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        //
        const hash = await bcrypt.hash(password, 13);
        const [ans] = await connection.query(
            'INSERT INTO customerinfo (username,address,email,password) VALUES (?, ?,?,?)',
            [username, address,email,hash]
        );

        console.log("USER LOGGIN IN");
        const userForToken = {
            name: username,
        };
        const accessToken = generateToken(userForToken);
        const refreshToken = jwt.sign(userForToken, process.env.REFRESH_TOKEN_SECRET);
        res.json({
            accessToken,
            refreshToken,
            expiresIn: '15m'
        });
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// make this a db, no array of objs
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const [rows] = await connection.query(
            'SELECT * FROM customerinfo WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];
        
        try {
            const match = await bcrypt.compare(password, user.password);
            
            if (!match) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const userForToken = {
                name: user.username,
            };

            const accessToken = generateToken(userForToken);
            const refreshToken = jwt.sign(userForToken, process.env.REFRESH_TOKEN_SECRET);
            
            // Store refresh token
            //refreshTokens.push(refreshToken);

            res.json({
                accessToken,
                refreshToken,
                expiresIn: '15m'
            });
        } catch (bcryptError) {
            console.error('bcrypt error:', bcryptError);
            return res.status(500).json({ error: 'Authentication error' });
        }
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
    }

    if (!refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const accessToken = generateToken({ name: user.name });
        res.json({ accessToken });
    });
});

app.delete('/logout', (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    res.sendStatus(204);
});

function generateToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Auth Server running on port ${PORT}`);
});
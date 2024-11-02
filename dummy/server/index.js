import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"
import cors from 'cors'

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors({
    origin:"*",
}))
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error('ERROR: ACCESS_TOKEN_SECRET is not set in .env file');
    process.exit(1);
}

const users = [{
    username: "Jai",
    password: "hello",
}, {
    username: "Sumit",
    password: "hello",
}];

app.get('/posts', authToken, (req, res) => {
    try {
        const userPost = users.find(user => user.username === req.user.name);
        console.log("Finding");
        if (!userPost) {
            return res.status(404).json({ error: 'User not found' });
        };
        console.log("sending info");
        res.json({
            username: userPost.username,
            message: "This is a protected resource"
        });
    } catch (error) {
        console.error('Error in /posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function authToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(403).json({ error: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Error in authToken middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Resource Server running on port ${PORT}`);
});

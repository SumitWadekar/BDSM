import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"
import cors from 'cors'
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors({
    origin: "*",
}))
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

if (!process.env.ACCESS_TOKEN_SECRET) {
    console.error('ERROR: ACCESS_TOKEN_SECRET is not set in .env file');
    process.exit(1);
}
//USER DETAILS
app.get('/posts', authToken, async (req, res) => {
    try {
        // Get username from the authenticated token instead of request body
        const username = req.user.name;

        const [rows] = await connection.query(
            'SELECT * FROM customerinfo WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userPost = rows[0];

        res.json({
            username: userPost.username,
            message: "This is a protected resource"
        });
    } catch (error) {
        console.error('Error in /posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// QUERY FOR BOOK
app.get('/products',authToken, async (req, res) => {
    try {
        const userquery = req.query.search;

        const [rows] = await connection.query(
            'SELECT * FROM products WHERE product_name like ?',
            [`%${userquery}%`]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'BOOK not found' });
        }

        res.json({
            message: "This is a protected resource",
            books: rows
        });
    } catch (error) {
        console.error('Error in /products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//
//GETTING CART ID FOR NEW USER




app.post('/cart', authToken, async (req, res) => {
    try {
        const username = req.user.name;

        const [rows] = await connection.query(
            'SELECT * FROM CartEntity WHERE user_id = ?',
            [username]
        );

        if (rows.length > 0) {
            return res.status(200).json({
                message: "This  cart was created",
                cartID: rows[0].cart_id
            });

        }
        const [result] = await connection.query('SELECT COUNT(*) AS cartCount FROM Cart_Count');
        const cartCount = result[0].cartCount;
        const newCartId = `C${cartCount + 1}`;
        await connection.query(
            'INSERT INTO CartEntity (cart_id, user_id) VALUES (?, ?)',
            [newCartId, username]
        );
        res.status(201).json({
            message: "This  cart was created",
            cartID: newCartId
        });

    } catch (error) {
        console.error('Error in /posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ADD THE BUTTON FOR ADD TO CART AND THEN INSRT INTO PR0CART bridge
app.post('/addtocart', authToken, async (req, res) => {
    try {
        const { username, CID, PID, quanti } = req.body;

        const [rows] = await connection.query(
            'SELECT * FROM products WHERE product_id = ?',
            [PID]
        );

        if (rows.length == 0) {
            return res.status(404).json({ error: 'Product not found' });

        }

        const [existingItem] = await connection.query(
            'SELECT * FROM  cart_product_bridge WHERE cart_id = ? AND p_id = ?',
            [CID, PID]
        );
        if (existingItem.length > 0) {
            //agar pehle se tha, to quantity kum ya jyada kar
            await connection.query(
                'UPDATE cart_product_bridge SET quantity = ? WHERE cart_id = ? AND p_id = ? ',
                [quanti, CID,PID]
            );
            return res.status(200).json({ message: 'Product quantity updated in cart' });
        }
        await connection.query(
            'INSERT INTO cart_product_bridge VALUES (?, ?, ?)',
            [CID,PID,quanti]  // Default to quantity of 1 if not provided
        );
        res.status(201).json({
            message: "This  cart was created",
        });

    } catch (error) {
        console.error('Error in /posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//

// Fetching products from the cart product bridge for a specific cart id

app.get('/cart_customer', authToken, async (req, res) => {
    try {
        const username = req.user.name;
        console.log(username);
        res.status(200).json({
            message: "Cart products retrieved successfully",
            prodInfo: "ABC",
        });
     } catch (error) {
        console.error('Error in /cart_custom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//
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

/*
        const[cart_number] = await connection.query(
            'SELECT * FROM CartEntity WHERE user_id=?',
            [username]
        );
        console.log(cart_number);
        const cart_no = cart_number[0].cart_id;
        const [rows] = await connection.query(
            'SELECT p_id,quantity FROM cart_product_bridge WHERE cart_id = ?',
            [cart_no]
        );
        res.status(200).json({
            message: "Cart products retrieved successfully",
            prodInfo: rows
        });
*/
   
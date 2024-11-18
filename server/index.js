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
        const [result] = await connection.query('SELECT COUNT(*) AS cartCount FROM cartentity');
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
/*
app.post('/addtocart', authToken, async (req, res) => {
    try {
        const {username} = req.user.name;
        const {PID, quanti } = req.body;
        const[cart_number] = await connection.query(
            'SELECT * FROM CartEntity WHERE user_id=?',
            [username]
        );
        const cart_no = cart_number[0].cart_id;
        const [rows] = await connection.query(
            'SELECT * FROM products WHERE product_id = ?',
            [PID]
        );

        if (rows.length == 0) {
            return res.status(404).json({ error: 'Product not found' });

        }

        const [existingItem] = await connection.query(
            'SELECT * FROM  cart_product_bridge WHERE cart_id = ? AND p_id = ?',
            [cart_no, PID]
        );
        if (existingItem.length > 0) {
            //agar pehle se tha, to quantity kum ya jyada kar
            await connection.query(
                'UPDATE cart_product_bridge SET quantity = ? WHERE cart_id = ? AND p_id = ? ',
                [quanti, cart_no,PID]
            );
            return res.status(200).json({ message: 'Product quantity updated in cart' });
        }
        await connection.query(
            'INSERT INTO cart_product_bridge VALUES (?, ?, ?)',
            [cart_no,PID,quanti]  // Default to quantity of 1 if not provided
        );
        res.status(201).json({
            message: "This  cart was created",
        });

    } catch (error) {
        console.error('Error in /posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
*/
app.post('/add-to-cart', authToken, async (req, res) => {
    try {
        const username = req.user.name;  // Removed unnecessary destructuring
        const { pid, quanti } = req.body;  // Match the frontend naming

        // First get the user's cart
        const [cartResults] = await connection.query(
            'SELECT cart_id FROM CartEntity WHERE user_id = ?',
            [username]
        );

        if (cartResults.length === 0) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const cartId = cartResults[0].cart_id;

        // Check if product exists
        const [products] = await connection.query(
            'SELECT * FROM products WHERE product_id = ?',
            [pid]
        );

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if product already in cart
        const [existingItems] = await connection.query(
            'SELECT * FROM cart_product_bridge WHERE cart_id = ? AND p_id = ?',
            [cartId, pid]
        );

        if (existingItems.length > 0) {
            // Update existing quantity
            await connection.query(
                'UPDATE cart_product_bridge SET quantity = ? WHERE cart_id = ? AND p_id = ?',
                [quanti, cartId, pid]
            );
            return res.json({ message: 'Cart updated successfully' });
        }

        // Add new product to cart
        await connection.query(
            'INSERT INTO cart_product_bridge (cart_id, p_id, quantity) VALUES (?, ?, ?)',
            [cartId, pid, quanti]
        );

        res.status(201).json({ message: 'Product added to cart successfully' });

    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});
//

// Fetching products from the cart product bridge for a specific cart id

app.get('/cart_customer', authToken, async (req, res) => {
    try {
        const username = req.user.name;
        console.log(username);
        const[cart_number] = await connection.query(
            'SELECT * FROM CartEntity WHERE user_id=?',
            [username]
        );
        console.log(cart_number);
        const cart_no = cart_number[0].cart_id;
        //
        const [cartItems] = await connection.query(`
            SELECT p.product_name, c.quantity,p.price,p.images,p.author,p.product_id
            FROM cart_product_bridge c
            JOIN PRODUCTS p ON c.p_id = p.product_id
            WHERE c.cart_id= ?
        `, [cart_no]);
        //
        /*
        const [rows] = await connection.query(
            'SELECT p_id,quantity FROM cart_product_bridge WHERE cart_id = ?',
            [cart_no]
        );
        */
        
        res.status(200).json({
            message: "Cart products retrieved successfully",
            prodInfo: cartItems
        });
     } catch (error) {
        console.error('Error in /cart_custom:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// delete from cart when you buy


app.post('/checkout', authToken, async (req, res) => {
    try {
        const username = req.user.name
        console.log(username);
        const [rows] = await connection.query(
            'SELECT * FROM cartentity WHERE user_id= ?',
            [username]
        );

        if (rows.length == 0) {
            return res.status(404).json({ error: 'CART DOES NOT EXIST' });

        }

        const [existingItem] = await connection.query(
            'DELETE FROM  cart_product_bridge WHERE cart_id = ?',
            [rows[0].cart_id]
        );

        res.status(201).json({
            message: "This  cart was cleared// Products purchased sucessfully",
        });

    } catch (error) {
        console.error('Error in /posts:', error);
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
   

app.post('/remove-from-cart', authToken, async (req, res) => {
    try {
        const username = req.user.name;
        const { pid } = req.body;

        // First get the user's cart
        const [cartResults] = await connection.query(
            'SELECT cart_id FROM CartEntity WHERE user_id = ?',
            [username]
        );
        if (cartResults.length === 0) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        const cartId = cartResults[0].cart_id;

        // Check if product exists in the cart
        const [existingItems] = await connection.query(
            'SELECT * FROM cart_product_bridge WHERE cart_id = ? AND p_id = ?',
            [cartId, pid]
        );
        if (existingItems.length === 0) {
            return res.status(404).json({ error: 'Product not found in cart' });
        }

        // Remove the product from the cart
        await connection.query(
            'DELETE FROM cart_product_bridge WHERE cart_id = ? AND p_id = ?',
            [cartId, pid]
        );

        res.json({ message: 'Product removed from cart successfully' });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove product from cart' });
    }
});
//
//TRANSACTION
app.post('/debit', authToken, async (req, res) => {
    try {
        const username = req.user.name;  // Use username from token
        const { amount } = req.body;  // The amount to be debited

        // Retrieve user's wallet balance
        const [userRows] = await connection.query(
            'SELECT wallet_amount FROM customerinfo WHERE username = ?',
            [username]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentBalance = userRows[0].wallet_amount;

        // Check if the balance is sufficient
        if (currentBalance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Deduct the amount
        await connection.query(
            'UPDATE customerinfo SET wallet_amount = wallet_amount - ? WHERE username = ?',
            [amount, username]
        );
        const [transactionCount] = await connection.query(
            'SELECT COUNT(*) AS count FROM transactions'
        );
        const transactionId = `T${transactionCount[0].count + 1}`;

        const [orderCount] = await connection.query(
            'SELECT COUNT(*) AS count FROM transactions'
        );
        const orderNumber = `ORD${orderCount[0].count + 1}`;        
        //insedting
        await connection.query(
            'INSERT INTO transactions (transaction_id, sender_username, amount, order_number, status) VALUES (?, ?, ?, ?, ?)',
            [transactionId, username, amount, orderNumber, 'completed']
        );
        // Log the transaction in the transactions table
        res.status(200).json({
            message: 'Amount debited successfully',
            transactionId,
            orderNumber
        });
    } catch (error) {
        console.error('Error in /debit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//>>
app.post('/decrement-quantity', authToken, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        // Check if the product exists and retrieve its current stock quantity
        const [productRows] = await connection.query(
            'SELECT quantity FROM products WHERE product_id = ?',
            [product_id]
        );

        if (productRows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const currentQuantity = productRows[0].quantity;

        // Check if there is enough stock to fulfill the request
        if (currentQuantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Decrement the quantity
        await connection.query(
            'UPDATE products SET quantity = quantity - ? WHERE product_id = ?',
            [quantity, product_id]
        );

        res.json({ message: 'Quantity reduced successfully' });
    } catch (error) {
        console.error('Error decrementing quantity:', error);
        res.status(500).json({ error: 'Failed to decrement quantity' });
    }
});


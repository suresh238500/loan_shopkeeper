
loan_shopkeeper

Loan Tracker for Shopkeepers is a backend API service built to help small business owners like kirana storekeepers and hardware shop owners manage customer credit transactions. The system allows shopkeepers to register and log in securely, add customers, record loans (credit sales), track repayments including partial payments

1. Clone the Repository

git clone https://github.com/suresh238500/loan_shopkeeper.git

2. Install Dependencies
Make sure Node.js is installed, then run:
npm install
3. Create a .env File
In the root directory, create a .env file and add:
PORT=3000
JWT_SECRET=  secret_key

4. Set Up the Database



Tables used ::

users

customers

loans

repayments

Queries ude to create Tables:

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  phone TEXT,
  address TEXT,
  trust_score INTEGER,
  credit_limit REAL
);

CREATE TABLE loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  customer_id INTEGER,
  description TEXT,
  amount REAL,
  issue_date TEXT,
  due_date TEXT,
  status TEXT
);

CREATE TABLE repayments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loan_id INTEGER,
  amount REAL,
  date TEXT
);


5. Run the Application

node app.js
The server will start at: "http://localhost:3000"
6. Test Using Postman or HTTP Client
Use Postman or VS Code's REST client (.http file) to send requests and test endpoints like /register, /login, /customers, /loans, etc.

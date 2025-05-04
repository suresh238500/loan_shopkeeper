# loan_shopkeeper
loan_shopkeeper

Loan Tracker for Shopkeepers is a backend API service built to help small business owners like kirana storekeepers, tailors, and hardware shop owners manage customer credit transactions. The system allows shopkeepers to register and log in securely, add customers, record loans (credit sales), track repayments (including partial payments), and receive alerts for overdue payments—all in a simple, digital format to replace traditional notebooks.


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

Ensure a SQLite database file named MySQL.db exists in your project folder.

It should include the following tables:

users

customers

loans

repayments

You can create this manually using SQLite browser or CLI.

5. Run the Application

node app.js
The server will start at:

http://localhost:3000
6. Test Using Postman or HTTP Client
Use Postman or VS Code's REST client (.http file) to send requests and test endpoints like /register, /login, /customers, /loans, etc.

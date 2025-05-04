const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
app.use(express.json())
const db = new sqlite3.Database('./sqllitetest.db')

// Middleware for JWT auth
function auth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).send('Token missing')
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET)
    req.user = user
    next()
  } catch {
    res.status(403).send('Invalid token')
  }
}

// ---------- AUTH ----------
/*app.post('/register', async (req, res) => {
  const {email, password} = req.body
  const hash = await bcrypt.hash(password, 10)
  db.run(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hash],
    function (err) {
      if (err) return res.status(400).send('Email already exists')
      res.send({id: this.lastID, email})
    },
  )
})*/

app.post('/register', async (req, res) => {
  const {email, password} = req.body
  const hash = await bcrypt.hash(password, 10)

  db.run(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hash],
    function (err) {
      if (err) {
        console.error('DB Error:', err.message)
        return res.status(400).send(`Registration failed: ${err.message}`)
      }
      res.send({id: this.lastID, email})
    },
  )
})

app.post('/login', (req, res) => {
  const {email, password} = req.body
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(400).send('Invalid login')
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).send('Invalid login')
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET)
    console.log('Generated JWT Token:', token)
    res.send({token})
  })
})

// ---------- CUSTOMERS ----------
app.post('/customers', auth, (req, res) => {
  const {name, phone, address, trust_score, credit_limit} = req.body
  db.run(
    'INSERT INTO customers (user_id, name, phone, address, trust_score, credit_limit) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, name, phone, address, trust_score, credit_limit],
    function (err) {
      if (err) return res.status(500).send('Error adding customer')
      res.send({id: this.lastID})
    },
  )
})

app.get('/customers', auth, (req, res) => {
  db.all(
    'SELECT * FROM customers WHERE user_id = ?',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).send('Error fetching customers')
      res.send(rows)
    },
  )
})

// ---------- LOANS ----------
app.post('/loans', auth, (req, res) => {
  const {customer_id, description, amount, issue_date, due_date} = req.body
  db.run(
    `INSERT INTO loans (user_id, customer_id, description, amount, issue_date, due_date, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id,
      customer_id,
      description,
      amount,
      issue_date,
      due_date,
      'pending',
    ],
    function (err) {
      if (err) return res.status(500).send('Error adding loan')
      res.send({id: this.lastID})
    },
  )
})

app.get('/loans', auth, (req, res) => {
  db.all(
    'SELECT * FROM loans WHERE user_id = ?',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).send('Error fetching loans')
      res.send(rows)
    },
  )
})

// ---------- REPAYMENTS ----------
app.post('/loans/:id/repay', auth, (req, res) => {
  const loanId = req.params.id
  const {amount, date} = req.body
  db.run(
    'INSERT INTO repayments (loan_id, amount, date) VALUES (?, ?, ?)',
    [loanId, amount, date],
    err => {
      if (err) return res.status(500).send('Error recording repayment')

      db.get(
        'SELECT amount, due_date FROM loans WHERE id = ?',
        [loanId],
        (err, loan) => {
          db.get(
            'SELECT SUM(amount) as paid FROM repayments WHERE loan_id = ?',
            [loanId],
            (err, result) => {
              const status =
                result.paid >= loan.amount
                  ? 'paid'
                  : new Date() > new Date(loan.due_date)
                  ? 'overdue'
                  : 'pending'
              db.run('UPDATE loans SET status = ? WHERE id = ?', [
                status,
                loanId,
              ])
            },
          )
        },
      )

      res.send('Repayment recorded')
    },
  )
})

// ---------- SUMMARY ----------
app.get('/summary', auth, (req, res) => {
  db.all(
    'SELECT * FROM loans WHERE user_id = ?',
    [req.user.id],
    (err, loans) => {
      let totalLoaned = 0,
        totalCollected = 0,
        overdue = 0
      let promises = loans.map(loan => {
        return new Promise(resolve => {
          db.get(
            'SELECT SUM(amount) as paid FROM repayments WHERE loan_id = ?',
            [loan.id],
            (err, r) => {
              const paid = r?.paid || 0
              totalLoaned += loan.amount
              totalCollected += paid
              if (loan.status === 'overdue') overdue += loan.amount - paid
              resolve()
            },
          )
        })
      })

      Promise.all(promises).then(() => {
        res.send({totalLoaned, totalCollected, overdue})
      })
    },
  )
})

// ---------- OVERDUE ----------
app.get('/overdue', auth, (req, res) => {
  db.all(
    `SELECT c.name, l.*
          FROM loans l JOIN customers c ON l.customer_id = c.id
          WHERE l.user_id = ? AND l.status = 'overdue'`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).send('Error fetching overdue loans')
      res.send(rows)
    },
  )
})

// ---------- SERVER ----------
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})

module.exports = app

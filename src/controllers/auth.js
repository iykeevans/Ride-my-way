import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import env from 'dotenv';
import randomstring from 'randomstring';
import log from 'fancy-log';
import db from '../database/connection';

env.config();

class Auth {
  static login(req, res) {
    const { email, password } = req.body;
    if ((email === undefined || email.trim().length < 1) || (password === undefined || password.trim().length < 1)) {
      res.status(400).json({
        status: 'error',
        message: 'Please provide an Email and a Password',
      });
    } else {
      db.query('SELECT * FROM users WHERE email=$1', [email])
        .then((result) => {
          if (result.rowCount < 1) {
            res.status(404).json({
              status: 'error',
              message: 'Login Failed! Email or Password is incorrect',
            });
          } else {
            const comparePassword = bcrypt.compareSync(password, result.rows[0].password);
            if (!comparePassword) {
              res.status(401).json({
                status: 'error',
                message: 'Login Failed! Email or Password is incorrect',
              });
            } else {
              const user = {
                id: result.rows[0].id,
              };
              jwt.sign({ user }, process.env.JWT_SECRET_TOKEN, { expiresIn: '48h' }, (error, token) => {
                if (error) {
                  res.status(500).json({
                    status: 'error',
                    message: 'Login failed! Please try again later',
                  });
                } else {
                  res.status(200).json({
                    status: 'success',
                    message: 'Login successful!',
                    user,
                    token,
                  });
                }
              });
            }
          }
        })
        .catch((error) => {
          res.status(500).json({
            status: 'error',
            message: 'Internal server error occured! Please try again later',
            error,
          });
        });
    }
  }

  static register(req, res) {
    const { name, email, password } = req.body;
    if ((name === undefined || name.trim().length < 1) || (email === undefined || email.trim().length < 1) || (password === undefined || password.trim().length < 1)) {
      res.status(400).json({
        status: 'error',
        message: 'All fields are required',
      });
    } else {
      db.query('SELECT * FROM users WHERE email=$1', [email])
        .then((firstResult) => {
          if (firstResult.rowCount >= 1) {
            res.status(400).json({
              status: 'error',
              message: 'Email is already registered',
            });
          } else {
            const ecryptedPassword = bcrypt.hashSync(password, 8);
            const uid = randomstring.generate(10);

            const userData = [uid, name, email, ecryptedPassword, 'avatar.png', new Date().toISOString(), new Date().toISOString()];
            const query = 'INSERT INTO users(id, name, email, password, photo, updated_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';

            db.query(query, userData)
              .then((secondResult) => {
                const user = { id: secondResult.rows[0].id };
                const token = jwt.sign({ user }, process.env.JWT_SECRET_TOKEN, { expiresIn: '48h' });

                res.status(201).json({
                  status: 'success',
                  message: 'Registration successful!',
                  user: {
                    id: secondResult.rows[0].id,
                    name: secondResult.rows[0].name,
                    email: secondResult.rows[0].email,
                    phone_number: secondResult.rows[0].phone_number,
                    photo: secondResult.rows[0].photo,
                    updated_at: secondResult.rows[0].updated_at,
                    created_at: secondResult.rows[0].created_at,
                  },
                  token,
                });
              })
              .catch((firstError) => {
                res.status(500).json({
                  status: 'error',
                  message: 'Internal server error occured! Please try again later',
                });
              });
          }
        })
        .catch((secondError) => {
          res.status(500).json({
            status: 'error',
            message: 'Internal server error occured! Please try again later',
          });
        });
    }
  }
}

module.exports = Auth;

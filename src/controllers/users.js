import bcrypt from 'bcrypt';
import db from '../database/connection';

export default class Users {
  static getAllUsers(req, res) {
    db.query('SELECT * FROM users')
      .then((firstResult) => {
        if (firstResult.rowCount < 1) {
          res.status(200).json({
            status: 'success',
            message: 'No user found',
          });
        } else {
          res.status(200).json({
            status: 'success',
            message: `${firstResult.rowCount} user(s) found`,
            users: firstResult.rows,
          });
        }
      })
      .catch(() => {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error. Please try again later',
        });
      });
  }

  static getOneUser(req, res) {
    db.query('SELECT * FROM users WHERE id=$1', [req.params.id])
      .then((firstResult) => {
        if (firstResult.rowCount < 1) {
          res.status(404).json({
            status: 'error',
            message: 'User not found',
          });
        } else {
          res.status(200).json({
            status: 'success',
            message: 'User found',
            user: firstResult.rows[0],
          });
        }
      })
      .catch(() => {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error. Please try again later',
        });
      });
  }

  static updateOneUser(req, res) {
    const loggedUserId = req.authData.user.id;
    const { id, data } = req.params;

    db.query('SELECT * FROM users WHERE id=$1', [req.params.id])
      .then((resultOne) => {
        if (resultOne.rowCount < 1) {
          res.status(404).json({
            status: 'error',
            message: 'User does not exist',
          });
        } else if (id !== loggedUserId) {
          res.status(403).json({
            status: 'error',
            message: 'You don\'t have permission to update this user',
          });
        } else if (data === undefined) {
          const { name, phoneNumber } = req.body;
          if (req.body.email !== undefined) {
            res.status(400).json({
              status: 'error',
              message: 'Sorry, you cannot update email address',
            });
          } else if ((name === undefined) || (phoneNumber === undefined)) {
            res.status(400).json({
              status: 'error',
              message: 'All fields are required',
            });
          } else {
            db.query('UPDATE users SET name=$1, phone_number=$2 WHERE id=$3 RETURNING *', [name, phoneNumber, req.params.id])
              .then((resultTwo) => {
                res.status(200).json({
                  status: 'success',
                  message: 'Profile updated successfully',
                  user: resultTwo.rows[0],
                });
              })
              .catch(() => {
                res.status(500).json({
                  status: 'error',
                  message: 'Internal server error. Please try again later',
                });
              });
          }
        } else if (data === 'photo') {
          const photo = req.body.photo === undefined || req.body.photo.trim().length < 1 ? 'avatar.png' : req.body.photo;
          db.query('UPDATE users SET photo=$1 WHERE id=$2 RETURNING *', [photo, req.params.id])
            .then((resultThree) => {
              res.status(200).json({
                status: 'success',
                message: 'Photo updated successfully',
                user: resultThree.rows[0],
              });
            })
            .catch(() => {
              res.status(500).json({
                status: 'error',
                message: 'Internal server error. Please try again later',
              });
            });
        } else {
          const { password } = req.body;
          if (password === undefined || password.trim().length < 1) {
            res.status(400).json({
              status: 'error',
              message: 'Password is required',
            });
          } else {
            const hashedPassword = bcrypt.hashSync(password.trim(), 8);
            db.query('UPDATE users SET password=$1 WHERE id=$2', [hashedPassword, req.params.id])
              .then(() => {
                res.status(200).json({
                  status: 'success',
                  message: 'Password updated successfully',
                });
              })
              .catch(() => {
                res.status(500).json({
                  status: 'error',
                  message: 'Internal server error. Please try again later',
                });
              });
          }
        }
      })
      .catch((e) => {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error. Please try again later',
        });
      });
  }
}

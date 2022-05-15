const e = require('express');
const express = require('express');
const mysql = require('mysql');

// Connection Pool
const pool = mysql.createPool({
  connectionLimit: 500,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

//View Users
exports.view = (req, res) => {
  // Connect to DB
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`Connected to ID ${connection.threadId}`);

    //   User Connection
    connection.query(
      'SELECT * FROM user WHERE status = "active"',
      (err, rows) => {
        //   Release when done with connection
        connection.release();

        if (!err) {
          let removedUser = req.query.removed;
          res.render('home', { rows, removedUser });
        } else {
          console.log(err);
        }

        console.log('The data from the user table: \n', rows);
      }
    );
  });
};

exports.find = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`Connected to ID ${connection.threadId}`);

    let searchTerm = req.body.search;

    connection.query(
      'SELECT * FROM user WHERE first_name LIKE ? OR last_name LIKE ?',
      [`%${searchTerm}%`, `%${searchTerm}%`],
      (err, rows) => {
        connection.release();

        if (!err) {
          res.render('home', { rows });
        } else {
          console.log(err);
        }
        console.log(`The data from the user table: \n`, rows);
      }
    );
  });
};

exports.form = (req, res) => {
  res.render('addUser');
};

// Add New User
exports.create = (req, res) => {
  const { first_name, last_name, email, mobile_number, comments } = req.body;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`Connected to ID ${connection.threadId}`);

    connection.query(
      'INSERT INTO user SET first_name = ?, last_name = ?, email = ?, mobile_number = ?, comments = ?',
      [first_name, last_name, email, mobile_number, comments],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render('addUser', { alert: 'User added successfully.' });
        } else {
          console.log(err);
        }
        console.log(`The data from the user table: \n:, rows`);
      }
    );
  });
};

// Edit User
exports.edit = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`Connected to ID ${connection.threadId}`);

    connection.query(
      'SELECT * FROM user WHERE id = ?',
      [req.params.id],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render('editUser', { rows });
        } else {
          console.log(err);
        }
        console.log('The data from the user table: \n', rows);
      }
    );
  });
};

// Update User
exports.update = (req, res) => {
  const { first_name, last_name, email, mobile_number, comments } = req.body;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`Connected to ID ${connection.threadId}`);

    connection.query(
      `UPDATE user Set first_name = ?, last_name = ?, email = ?, mobile_number = ?, comments = ? WHERE id =?`,
      [first_name, last_name, email, mobile_number, comments, req.params.id],
      (err, rows) => {
        connection.release();
        if (!err) {
          pool.getConnection((err, connection) => {
            if (err) throw err;
            console.log(`Connected to ID ${connection.threadId}`);
            connection.query(
              'SELECT * FROM user WHERE id = ?',
              [req.params.id],
              (err, rows) => {
                connection.release();
                if (!err) {
                  res.render('editUser', {
                    rows,
                    alert: `${first_name} ${last_name} has been updated`,
                  });
                } else {
                  console.log(err);
                }
                console.log('The data from the user table: \n', rows);
              }
            );
          });
        } else {
          console.log(err);
        }
        console.log('The data from user table: \n', rows);
      }
    );
  });
};

// Remove User
exports.delete = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`Connected to ID ${connection.threadId}`);

    connection.query(
      'UPDATE user SET status = ? WHERE id = ?',
      ['removed', req.params.id],
      (err, rows) => {
        connection.release();

        if (!err) {
          let removedUser = encodeURIComponent('User successfully removed.');
          res.redirect(`/?removed=${removedUser}`);
        } else {
          console.log(err);
        }
        console.log('The data from the table: \n', rows);
      }
    );
  });
};

// // Delete User
// exports.delete = (req, res) => {
//   pool.getConnection((err, connection) => {
//     if (err) throw err;
//     console.log(`Connected to ID ${connection.threadId}`);

//     connection.query(
//       'DELETE FROM user WHERE id = ?',
//       [req.params.id],
//       (err, rows) => {
//         connection.release();

//         if (!err) {
//           res.redirect('/');
//         } else {
//           console.log(err);
//         }
//         console.log('The data from the table: \n', rows);
//       }
//     );
//   });
// };

// View Users
exports.viewUser = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`Connected as ID ${connection.threadId}`);

    connection.query(
      'Select * FROM user WHERE id = ?',
      [req.params.id],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render('viewUser', { rows });
        } else {
          console.log(err);
        }
        console.log('The data from the user table: \n', rows);
      }
    );
  });
};

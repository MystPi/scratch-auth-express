const express = require('express');
const scratchauth = require('../src');

const app = express();

const needsAuth = scratchauth(app, {
  secret: 'supersecret',
  appName: 'Express App',
  succeeded(req, res) {
    res.redirect('/dashboard');
  },
  failed(req, res) {
    res.send('<h1>Fail! <a href="/auth/login">Click here</a> to try again.');
  },
});

app.get('/', (req, res) => {
  if (res.locals.loggedIn) {
    res.send(`
      <h1>You are signed in as ${res.locals.username}</h1>
      <p>Head to your <a href="/dashboard">dashboard</a></p>
    `);
  } else {
    res.send(`
      <h1>You are not signed in</h1>
      <p><a href="/auth/login">Click here</a> to sign in.</p>
    `);
  }
});

app.get('/dashboard', needsAuth(), (req, res) => {
  res.send(`
    <h1>Welcome to your dashboard, ${res.locals.username}!</h1>
    <p><a href="/auth/logout">logout</a> &bull; <a href="/">home</a></p>
  `);
});

app.listen(1234, () => {
  console.log('Listening on port 1234: http://localhost:1234');
});

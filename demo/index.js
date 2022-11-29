const express = require('express');
const { session, startAuth, endAuth, getUser, logout } = require('../');

const app = express();

app.use(session('supersecret'));
app.use(getUser);

app.get('/', (req, res) => {
  if (res.locals.loggedIn) {
    res.send(`
      <h1>You are signed in as ${res.locals.username}</h1>
      <p>Head to your <a href="/dashboard">dashboard</a></p>
    `);
  } else {
    res.send(`
      <h1>You are not signed in</h1>
      <p><a href="/auth">Click here</a> to sign in.</p>
    `);
  }
});

app.get('/auth', startAuth({ redirect: '/auth/end' }));

app.get('/auth/end', endAuth, (req, res) => {
  if (res.locals.authSucceeded) {
    res.redirect('/dashboard');
  } else {
    res.send('<h1>Fail! <a href="/auth">Click here</a> to try again.');
  }
});

app.get('/dashboard', (req, res) => {
  if (res.locals.loggedIn) {
    res.send(`
      <h1>Welcome to your dashboard, ${res.locals.username}!</h1>
      <p><a href="/logout">logout</a> &bull; <a href="/">home</a></p>
    `);
  } else {
    res.redirect('/auth');
  }
});

app.get('/logout', logout());

app.listen(1234, () => {
  console.log('Listening on port 1234: http://localhost:1234');
});

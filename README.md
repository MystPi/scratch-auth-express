# Express with Scratch Auth has never been easier

- Plug and play, minimal setup required
- Easy to use

## Installation

```
npm install sa-express
```

## Initial Setup

```js
const express = require('express');

// Import the middleware needed for configuration
const { session, getUser } = require('sa-express');

// Use the session middleware. Replace 'supersecret' with a secure password hidden
// in an environment variable.
app.use(session('supersecret'));

// This middleware populates `res.locals` with useful information. If you don't
// need this information on every route, you can use the middleware individually
// or you can access `req.session` directly (see the 'Using Auth/Protected Routes
// section below).
app.use(getUser);
```

#### Options (for `session()`)

- `secret` — Secret for `cookie-session`
- `maxAge` — The amount of time, in milliseconds, that the login will be valid for
- `otherOpts` — Other options to pass to `cookie-parser` ([docs](https://github.com/expressjs/cookie-session#options))

## Usage

### Starting Auth

```js
const { startAuth } = require('sa-express');

// `startAuth` will redirect the user to Scratch Auth for authentication. After
// auth the user will be directed back to the verification route you provide
app.get('/auth', startAuth({ redirect: '/auth/end' }));
```

#### Options

- `redirect: '/'` — Route to redirect to after auth
- `name: ''` — Name of your app for Scratch Auth to use

### Verifying Auth

```js
const { endAuth } = require('sa-express');

// `endAuth` will verify the auth response sent by `startAuth`. If it succeeds,
// `res.locals.authSucceeded` will be true and the username will be stored in the
// session
app.get('/auth/end', endAuth, (req, res) => {
  if (res.locals.authSucceeded) {
    res.redirect('/dashboard');
  } else {
    res.send('Auth failed!');
  }
});
```

#### Options

N/A

### Logging Out

```js
const { logout } = require('sa-express');

// `logout` will clear the session, effectively logging out the user
app.get('/logout', logout());
```

#### Options

- `redirect: '/'` — Route to redirect to after logging out

### Using Auth/Protected Routes

```js
const { getUser } = require('sa-express');

// If you configured Express to use the `getUser` middleware on all routes,
// `res.locals` will contain `username` and `loggedIn`
app.get('/dashboard', (req, res) => {
  if (res.locals.loggedIn) {
    res.send(`Welcome to your dashboard, ${res.locals.username}!`);
  } else {
    res.redirect('/auth');
  }
});

// If not, you have two options. Either use `getUser` before an idividual handler,
// and use `res.locals` like normal...
app.get('/dashboard', getUser, (req, res) => {
  res.send(`You are ${res.locals.username}`);
});

// ...or use `req.session.username` directly
app.get('/dashboard', (req, res) => {
  res.send(`You are ${req.session.username}`);
});

// The benefit of using `getUser` are the convenience properties like `loggedIn`,
// and more properties might be added in the future.
```

#### Options

N/A

## Demo Application

A demo can be found in demo/.

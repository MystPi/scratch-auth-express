# No-pain Express middleware for Scratch Auth

![JWT Compatible](https://jwt.io/img/badge-compatible.svg)

- Plug and play, minimal setup required
- Easy to use
- Uses [JSON Web Tokens](https://jwt.io) (JWT)

## Installation

```
npm install sa-express
```

## Initial Setup

```js
const express = require('express');

// Require the middleware needed for configuration
const { middleware, getUser } = require('sa-express');

// Set the auth secret used to sign JWT tokens. This should be
// a secure password hidden in an environment variable
app.set('auth secret', process.env.AUTH_SECRET);

// Use the basic middleware. This includes cookie-parser, so
// you should remove any existing `app.use(cookieParser())` lines
app.use(middleware);

// (Optional) If you want `req.authUser` to be available on all
// routes, use this middleware. Note that it will slow your routes
// down a tiny bit (milliseconds)
app.use(getUser);
```

## Usage

### Starting Auth

```js
const { startAuth } = require('sa-express');

// `startAuth` will redirect the user to Scratch Auth for
// authentication. After auth the user will be directed back to the
// verification route you provide
app.get('/auth', startAuth({ redirect: '/auth/end' }));
```

#### Options

- `redirect: '/'` — Route to redirect to after auth
- `name: ''` — Name of your app for Scratch Auth to use

### Verifying Auth

```js
const { endAuth } = require('sa-express');

// `endAuth` will verify the auth response sent by `startAuth`. If
// it succeeds, `req.authSucceeded` will be true and a JWT will be
// stored in the user's browser cookies
app.get('/auth/end', endAuth(), (req, res) => {
  if (req.authSucceeded) {
    res.redirect('/dashboard');
  } else {
    res.send('Auth failed!');
  }
});
```

#### Options

- `expiresIn: 7 * 24 * 3600` — The amount of time, in seconds, that the login will be valid for

### Logging Out

```js
const { logout } = require('sa-express');

// `logout` will clear the JWT set in the user's cookies
app.get('/logout', logout());
```

#### Options

- `redirect: '/'` — Route to redirect to after logging out

### Using Auth/Protected Routes

```js
const { getUser } = require('sa-express');

// If you configured Express to use the `getUser` middleware on all
// routes, `req.authUser` will be set to the user's username if
// authenticated
app.get('/dashboard', (req, res) => {
  if (req.authUser) {
    res.send(`Welcome to your dashboard, ${req.authUser}!`);
  } else {
    res.redirect('/auth');
  }
});

// If not, simply use `getUser` before the handler. For example:
app.get('/dashboard', getUser, (req, res) => { ... });
```

#### Options

N/A

## Demo Application

A demo can be found in demo/.

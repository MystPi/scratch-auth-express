# Scratch Auth integration for Express

- Plug and play, minimal setup required
- Easy to use

## Installation

```
npm install sa-express
```

## Usage

```js
const express = require('express');
const scratchauth = require('sa-express');

const app = express();

const needsAuth = scratchauth(app, {
  secret: 'SuperSecret1234',
  appName: 'My Cool Express App',
  succeeded(req, res) {
    res.redirect('/welcome');
  },
  failed(req, res) {
    res.redirect('/authfailed');
  },
});
```

### Options

| Name | Description | Default |
| ---- | ----------- | ------- |
| `secret` | Secret that `cookie-session` will use. It should be stored securely in an environment variable. | *No default; this option is required* |
| `appName` | Name for Scratch Auth to use on the login page. | `''` |
| `loginRoute` | Route for redirecting the user to Scratch Auth. | `'/auth/login'` |
| `verifyRoute` | Route for verifying Scratch Auth's repsonse. | `'/auth/verify'` |
| `logoutRoute` | Route for logging the user out. | `'/auth/logout'` |
| `logoutRedirect` | Route to redirect to after logging out. | `'/'` |
| `succeeded` | Called when the user has been logged in successfully. | `(req, res) => res.redirect('/')` |
| `failed` | Called when auth has failed. | `(req, res) => res.send('Auth failed')` |
| `cookie` | [More options here.](https://github.com/expressjs/cookie-session#cookie-options) | By default lasts 7 days with `sameSite: lax`. |

### Using Auth/Protected Routes

Calling `scratchauth` returns a middleware for protected routes. It will redirect the user to the route given if they are not logged in. By default, the route is whatever you passed for `loginRoute`.

```js
app.get('/dashboard', needsAuth(), (req, res) => {
  res.send(`Welcome to your dashboard, ${res.locals.username}!`);
});
```

You can manually implement protected routes by using `res.locals.loggedIn`:

```js
app.get('/dashboard', (req, res) => {
  if (res.locals.loggedIn) {
    res.send(`Welcome to your dashboard, ${res.locals.username}!`);
  } else {
    res.redirect('/auth/login');
  }
});
```

In fact, `needsAuth` uses `res.locals.loggedIn` under the hood, so both of the methods are exactly equivalent.

## Demo Application

A demo can be found in demo/.

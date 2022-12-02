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

scratchauth(app, {
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

- `secret` Secret that `cookie-session` will use. It should be stored securely in an environment variable. This is the only required option.
- `appName` Name for Scratch Auth to use on the login page.
- `loginRoute: /auth/login` Route for redirecting the user to Scratch Auth.
- `verifyRoute: /auth/verify` Route for verifying Scratch Auth's repsonse.
- `logoutRoute: /auth/logout` Route for logging the user out.
- `logoutRedirect: /` Route to redirect to after logging out.
- `succeeded: (req, res) => res.redirect('/')` Called when the user has been logged in successfully.
- `failed: (req, res) => res.send('Auth failed')` Called when auth has failed.
- `cookie` By default lasts 7 days with `sameSite: lax`. [More options here.](https://github.com/expressjs/cookie-session#cookie-options)

### Using Auth/Protected Routes

`res.locals.loggedIn` will return `true` if logged in, so implementing protected routes is a snap. `res.locals.username` will contain the user's username.

```js
app.get('/dashboard', (req, res) => {
  if (res.locals.loggedIn) {
    res.send(`Welcome to your dashboard, ${res.locals.username}!`);
  } else {
    res.redirect('/auth');
  }
});
```

## Demo Application

A demo can be found in demo/.

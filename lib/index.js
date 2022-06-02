const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const memoize = require('memoizee');
const cookieParser = require('cookie-parser');

const defaultCookie = 'scratchauthtoken';
const verifyJWT = memoize(jwt.verify);

/**
 * Wrapper for the cookie-parser middleware. Replace cookie-parser with this if you
 * are already using it.
 */
exports.middleware = cookieParser();

/**
 * Start the authentication process by redirecting the user to Scratch Auth, then
 * redirecting them back to the given route after they have finished.
 * @param {Object} options Options to pass to the middleware
 * @param {string} [options.redirect] The route to redirect to after authentication
 * @param {string} [options.name] The name of your application, to be used by Scratch Auth
 * @returns {function} The middleware
 */
exports.startAuth = ({ redirect = '/', name = '' } = {}) => {
  return (req, res, next) => {
    const encoded = Buffer.from(
      req.protocol + '://' + req.get('host') + redirect
    ).toString('base64');
    res.redirect(
      `https://auth.itinerary.eu.org/auth/?redirect=${encoded}&name=${name}`
    );
    next();
  };
};

/**
 * End authentication by validating the private code (given as a query string) and creating
 * a JWT stored in a cookie. The JWT is signed with the app's secret, and its payload is of
 * the form `{ name: '<username>' }`.
 * @param {Object} options Options to pass to the middleware
 * @param {number} [options.expiresIn] The amount of time, in seconds, that the login will be valid for
 * @returns {function} The middleware
 */
exports.endAuth = ({ expiresIn = 7 * 24 * 3600 } = {}) => {
  return async (req, res, next) => {
    req.authSucceeded = false;

    if (req.query.privateCode) {
      const result = await fetch(
        'https://auth.itinerary.eu.org/api/auth/verifyToken?privateCode=' +
          req.query.privateCode
      );
      const json = await result.json();

      if (json.valid) {
        const token = jwt.sign(
          { name: json.username },
          req.app.get('auth secret'),
          { expiresIn }
        );
        res.cookie(req.app.get('auth cookie') || defaultCookie, token, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          maxAge: expiresIn * 1000,
        });
        req.authSucceeded = true;
        req.authUser = json.username;
      }
    }

    next();
  };
};

/**
 * Log the user out by clearing their JWT cookie and redirecting them to a given route.
 * @param {string} [redirect] The route to redirect to after logging out
 * @returns {function} The middleware
 */
exports.logout = (redirect = '/') => {
  return (req, res, next) => {
    res.clearCookie(req.app.get('auth cookie') || defaultCookie, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    res.redirect(redirect);
  };
};

/**
 * Validate the JWT stored in a cookie, and return the username if it is valid.
 * @param {Request} req An Express request object
 * @returns {string|null} The username of the user, or null if the user is not logged in or doesn't have a valid JWT
 */
exports.getAuth = (req) => {
  let data;
  try {
    data = verifyJWT(
      req.cookies[req.app.get('auth cookie') || defaultCookie],
      req.app.get('auth secret')
    );
  } catch (e) {
    data = null;
  }

  return data ? data.name : null;
};

/**
 * Middleware that sets `authUser` on the request object if the user is logged in.
 */
exports.getUser = (req, res, next) => {
  req.authUser = exports.getAuth(req);
  next();
};

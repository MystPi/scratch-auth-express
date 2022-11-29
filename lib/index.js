const fetch = require('node-fetch');
const cookieSession = require('cookie-session');

exports.session = (secret, maxAge = 7 * 24 * 3600 * 1000, otherOpts = {}) => {
  return cookieSession({
    secret,
    maxAge,
    sameSite: 'lax',
    ...otherOpts,
  });
};

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

exports.endAuth = async (req, res, next) => {
  res.locals.authSucceeded = false;

  if (req.query.privateCode) {
    const result = await fetch(
      'https://auth.itinerary.eu.org/api/auth/verifyToken?privateCode=' +
        req.query.privateCode
    );
    const json = await result.json();

    if (json.valid) {
      res.locals.authSucceeded = true;
      req.session.username = json.username;
    }
  }

  next();
};

exports.logout = (redirect = '/') => {
  return (req, res, next) => {
    req.session = null;
    res.redirect(redirect);
  };
};

exports.getUser = (req, res, next) => {
  const username = req.session.username;
  res.locals.username = username ? username : null;
  res.locals.loggedIn = username ? true : false;
  next();
};

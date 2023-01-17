const fetch = require('node-fetch');
const cookieSession = require('cookie-session');

module.exports = (
  app,
  {
    secret,
    appName = '',
    loginRoute = '/auth/login',
    verifyRoute = '/auth/verify',
    logoutRoute = '/auth/logout',
    logoutRedirect = '/',
    succeeded = (req, res) => res.redirect('/'),
    failed = (req, res) => res.send('Auth failed'),
    cookie = {},
  }
) => {
  app.use(
    cookieSession({
      secret,
      maxAge: 7 * 24 * 3600 * 1000,
      sameSite: 'lax',
      ...cookie,
    })
  );

  app.use((req, res, next) => {
    const username = req.session.username;
    res.locals.username = username ? username : null;
    res.locals.loggedIn = username ? true : false;
    next();
  });

  app.get(loginRoute, (req, res) => {
    const encoded = Buffer.from(
      req.protocol + '://' + req.get('host') + verifyRoute
    ).toString('base64');
    res.redirect(
      `https://auth.itinerary.eu.org/auth/?redirect=${encoded}&name=${appName}`
    );
  });

  app.get(verifyRoute, async (req, res) => {
    if (req.query.privateCode) {
      const result = await fetch(
        'https://auth.itinerary.eu.org/api/auth/verifyToken?privateCode=' +
          req.query.privateCode
      );
      const json = await result.json();

      if (json.valid) {
        req.session.username = json.username;
        return succeeded(req, res);
      }
    }
    return failed(req, res);
  });

  app.get(logoutRoute, (req, res) => {
    req.session = null;
    res.redirect(logoutRedirect);
  });

  return (route = loginRoute) =>
    (req, res, next) => {
      if (res.locals.loggedIn) {
        next();
      } else {
        res.redirect(route);
      }
    };
};

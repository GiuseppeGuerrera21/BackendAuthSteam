const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');

const app = express();

// === CONFIGURAZIONE BASE ===
const PORT = process.env.PORT || 3000;
const STEAM_API_KEY = 'BC6FE6C9ECC75A20AE247FA48DF33F9C';
const REALM = 'https://steam-auth-backend.onrender.com'; // URL del tuo backend su Render
const RETURN_URL = `${REALM}/auth/steam/return`;
const MOBILE_REDIRECT = 'quizmindset://auth/steam/callback';

// === MIDDLEWARE SESSIONE ===
app.use(session({
  secret: 'steam-secret-key-super-sicuro',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// === CONFIGURAZIONE PASSPORT STEAM ===
passport.use(new SteamStrategy({
  returnURL: RETURN_URL,
  realm: REALM,
  apiKey: STEAM_API_KEY
}, (identifier, profile, done) => {
  console.log('✅ Steam login riuscito per:', profile.displayName);
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// === ROTTA HOME (test rapido) ===
app.get('/', (req, res) => {
  res.send('<h1>🎮 Steam Auth Backend Online</h1><a href="/auth/steam">Login con Steam</a>');
});

// === ROTTA PER INIZIARE LOGIN ===
app.get('/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => res.redirect('/')
);

// === ROTTA DI RITORNO DOPO LOGIN ===
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    if (!req.user || !req.user.id) {
      return res.redirect(`${MOBILE_REDIRECT}?error=no_user`);
    }

    const steamId = req.user.id;
    const username = req.user.displayName || 'Unknown';
    const redirectUrl = `${MOBILE_REDIRECT}?steamId=${steamId}`;

    console.log('✅ Redirect verso app:', redirectUrl);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Login Successful</title>
          <script>
            setTimeout(() => { window.location.href = '${redirectUrl}'; }, 800);
          </script>
        </head>
        <body style="background:#1a202c; color:white; text-align:center; padding:50px; font-family:sans-serif;">
          <h1>✅ Login completato!</h1>
          <p>Benvenuto, <strong>${username}</strong></p>
          <p>SteamID: ${steamId}</p>
          <p>Ritorno all'app in corso...</p>
          <a href="${redirectUrl}" style="color:#48bb78;">Apri l'app manualmente</a>
        </body>
      </html>
    `);
  }
);

// === AVVIO SERVER ===
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Steam Auth Server ONLINE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Realm: ${REALM}`);
  console.log(`🔗 Auth URL: ${REALM}/auth/steam`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

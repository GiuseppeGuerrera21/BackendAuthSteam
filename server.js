const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// CONFIGURAZIONE
const STEAM_API_KEY = 'BC6FE6C9ECC75A20AE247FA48DF33F9C';
const REALM = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
const RETURN_URL = `${REALM}/auth/steam/return`;
const MOBILE_REDIRECT = 'myapp://auth'; // Il tuo deep link

// Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'il-tuo-secret-super-sicuro-cambiami',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

// Configurazione Passport Steam
passport.use(new SteamStrategy({
    returnURL: RETURN_URL,
    realm: REALM,
    apiKey: STEAM_API_KEY
},
    (identifier, profile, done) => {
        return done(null, profile);
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Routes
app.get('/', (req, res) => {
    res.send(`
    <html>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>🎮 Steam Auth Server</h1>
        <p>Server is running correctly!</p>
        <p><a href="/auth/steam">Test Login Steam</a></p>
      </body>
    </html>
  `);
});

// Inizia il login Steam
app.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    }
);

// Callback dopo login Steam
app.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        const steamId = req.user.id;
        console.log('✅ Login effettuato - SteamID:', steamId);

        // Reindirizza alla app mobile
        res.redirect(`${MOBILE_REDIRECT}?steamid=${steamId}`);
    }
);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', realm: REALM });
});

app.listen(PORT, () => {
    console.log(`🚀 Server in esecuzione su porta ${PORT}`);
    console.log(`🌍 Realm: ${REALM}`);
    console.log(`🔗 URL autenticazione: ${REALM}/auth/steam`);
});
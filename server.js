const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// CONFIGURAZIONE - IMPORTANTE!
const STEAM_API_KEY = 'BC6FE6C9ECC75A20AE247FA48DF33F9C';
const REALM = 'https://steam-auth-backend.onrender.com'; // ⬅️ DEVE essere il TUO URL Render
const RETURN_URL = `${REALM}/auth/steam/return`;
const MOBILE_REDIRECT = 'steamloginapp://auth'; // ⬅️ Schema della tua app

console.log('🔧 Configurazione Backend:');
console.log('   REALM:', REALM);
console.log('   RETURN_URL:', RETURN_URL);
console.log('   MOBILE_REDIRECT:', MOBILE_REDIRECT);

// Middleware
app.use(session({
    secret: 'steam-secret-key-super-sicuro-cambiami-in-produzione',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // ⬅️ Importante: false per HTTP, true solo se usi HTTPS
        maxAge: 3600000 // 1 ora
    }
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
        console.log('✅ Steam auth success!');
        console.log('   Identifier:', identifier);
        console.log('   SteamID:', profile.id);
        console.log('   Username:', profile.displayName);
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
    <!DOCTYPE html>
    <html>
      <head>
        <title>Steam Auth Server</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial; text-align: center; padding: 50px; background: #1a202c; color: white;">
        <h1>🎮 Steam Auth Server</h1>
        <p style="color: #48bb78; font-size: 18px;">✅ Server is running!</p>
        <div style="margin: 30px 0; padding: 20px; background: #2d3748; border-radius: 10px; display: inline-block;">
          <p><strong>Configuration:</strong></p>
          <p style="color: #00aced;">Realm: ${REALM}</p>
          <p style="color: #00aced;">Return URL: ${RETURN_URL}</p>
          <p style="color: #00aced;">Mobile Redirect: ${MOBILE_REDIRECT}</p>
        </div>
        <br><br>
        <a href="/auth/steam" style="background: #1b2838; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          🔐 Test Steam Login
        </a>
      </body>
    </html>
  `);
});

// Inizia il login Steam
app.get('/auth/steam', (req, res, next) => {
    console.log('🚀 Richiesta login Steam ricevuta');
    passport.authenticate('steam', {
        failureRedirect: '/',
        failureMessage: true
    })(req, res, next);
});

// Callback dopo login Steam
app.get('/auth/steam/return',
    passport.authenticate('steam', {
        failureRedirect: '/',
        failureMessage: true
    }),
    (req, res) => {
        if (!req.user || !req.user.id) {
            console.log('❌ Errore: nessun user trovato');
            return res.redirect(`${MOBILE_REDIRECT}?error=no_user`);
        }

        const steamId = req.user.id;
        const username = req.user.displayName || 'Unknown';

        console.log('✅✅✅ Login COMPLETATO con successo!');
        console.log('   SteamID:', steamId);
        console.log('   Username:', username);
        console.log('   Redirect verso app mobile...');

        // Reindirizza alla app mobile con lo SteamID
        const redirectUrl = `${MOBILE_REDIRECT}?steamid=${steamId}`;
        console.log('   URL di redirect:', redirectUrl);

        res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Login Successful</title>
          <meta charset="utf-8">
          <script>
            // Prova a reindirizzare automaticamente
            setTimeout(() => {
              window.location.href = '${redirectUrl}';
            }, 1000);
          </script>
        </head>
        <body style="font-family: Arial; text-align: center; padding: 50px; background: #1a202c; color: white;">
          <h1>✅ Login Steam Completato!</h1>
          <p style="font-size: 18px; margin: 20px 0;">Benvenuto, <strong>${username}</strong>!</p>
          <p style="color: #00aced;">SteamID: ${steamId}</p>
          <br>
          <p style="color: #a0aec0;">Ritorno all'app in corso...</p>
          <br><br>
          <a href="${redirectUrl}" style="background: #48bb78; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            📱 Apri l'App Manualmente
          </a>
        </body>
      </html>
    `);
    }
);

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Errore server:', err);
    res.status(500).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Error</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px; background: #1a202c; color: white;">
        <h1>❌ Errore</h1>
        <p style="color: #e53e3e;">${err.message}</p>
        <br>
        <a href="/" style="color: #00aced;">Torna alla Home</a>
      </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        realm: REALM,
        returnUrl: RETURN_URL,
        mobileRedirect: MOBILE_REDIRECT
    });
});

app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Steam Auth Server ONLINE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌍 Realm: ${REALM}`);
    console.log(`🔗 Auth URL: ${REALM}/auth/steam`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
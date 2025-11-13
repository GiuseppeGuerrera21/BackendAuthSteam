const MOBILE_REDIRECT = 'quizmindset://auth/steam/callback';

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/', failureMessage: true }),
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

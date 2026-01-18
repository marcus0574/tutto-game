const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Der Server stellt dein Spiel zur Verfügung
app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('Ein Spieler hat sich verbunden!');

    // Wenn ein Spieler würfelt, sagen wir es allen anderen
    socket.on('wuerfel_klick', (daten) => {
        io.emit('spieler_hat_gewuerfelt', daten);
    });

    socket.on('disconnect', () => {
        console.log('Ein Spieler hat das Spiel verlassen.');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Tutto-Server läuft auf Port ${PORT}`);
});

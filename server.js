const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));

// Speicher für den Spielzustand auf dem Server
let aktuellesSpiel = {
    karte: null,
    wuerfel: [],
    aktiverSpieler: null
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Ein Spieler hat sich verbunden');

    // Wenn ein Spieler würfelt
    socket.on('anfrage_wurf', (daten) => {
        let neueWuerfel = [];
        for(let i=0; i < daten.anzahl; i++) {
            neueWuerfel.push(Math.floor(Math.random() * 6) + 1);
        }
        aktuellesSpiel.wuerfel = neueWuerfel;
        // Schickt die Würfel an ALLE
        io.emit('ergebnis_wurf', { werte: neueWuerfel });
    });

    // Wenn jemand eine Karte zieht
    socket.on('ziehe_karte', () => {
        // Der Server entscheidet, welche Karte kommt (Beispiel: 0-9 für deine Kartentypen)
        const kartenIndex = Math.floor(Math.random() * 10); 
        aktuellesSpiel.karte = kartenIndex;
        // Schickt die Karte an ALLE, damit jeder die gleiche sieht
        io.emit('neue_karte', kartenIndex);
    });
});

// Das 0.0.0.0 ist entscheidend für die Erreichbarkeit
const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log('Server läuft auf Port ' + PORT);
});

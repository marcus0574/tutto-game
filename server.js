const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Damit Render alle Bilder und Sounds findet
app.use(express.static(__dirname));

// Speicher für den Spielzustand auf dem Server
let aktuellesSpiel = {
    gestartet: false,
    spieler: [],
    zielPunkte: 6000,
    aktuelleKarte: null
};

// Karten-Definitionen (passend zu deinen Bildern)
const kartenTypen = [
    { name: "KLEEBLATT", type: "kleeblatt", imgKey: "kleeblatt" },
    { name: "FEUERWERK", type: "feuerwerk", imgKey: "feuerwerk" },
    { name: "STOP", type: "stop", imgKey: "stop" },
    { name: "STRASSE", type: "strasse", imgKey: "strasse" },
    { name: "PLUS/MINUS", type: "plusminus", imgKey: "plusminus" },
    { name: "x2 KARTE", type: "x2", imgKey: "x2" },
    { name: "BONUS 200", type: "bonus", value: 200, imgKey: "bonus200" },
    { name: "BONUS 300", type: "bonus", value: 300, imgKey: "bonus300" },
    { name: "BONUS 400", type: "bonus", value: 400, imgKey: "bonus400" },
    { name: "BONUS 500", type: "bonus", value: 500, imgKey: "bonus500" },
    { name: "BONUS 600", type: "bonus", value: 600, imgKey: "bonus600" }
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Ein Spieler hat sich verbunden');

    // 1. SPIEL STARTEN (für alle gleichzeitig)
    socket.on('spiel_starten', (data) => {
        aktuellesSpiel.gestartet = true;
        aktuellesSpiel.spieler = data.players;
        aktuellesSpiel.zielPunkte = data.winLimit;
        
        console.log("Spiel wird gestartet mit:", data.players);
        // Schickt den Startbefehl an ALLE
        io.emit('spiel_start_bestaetigung', data);
    });

    // 2. WÜRFELN (Server generiert die Zahlen für alle)
    socket.on('anfrage_wurf', (daten) => {
        let neueWuerfel = [];
        for(let i=0; i < daten.anzahl; i++) {
            neueWuerfel.push(Math.floor(Math.random() * 6) + 1);
        }
        console.log("Server würfelt:", neueWuerfel);
        // Schickt das exakte Ergebnis an ALLE
        io.emit('ergebnis_wurf', { werte: neueWuerfel });
    });

    // 3. KARTE ZIEHEN (Server bestimmt die Karte für alle)
    socket.on('ziehe_karte', () => {
        const zufallsIndex = Math.floor(Math.random() * kartenTypen.length);
        const gezogeneKarte = kartenTypen[zufallsIndex];
        
        aktuellesSpiel.aktuelleKarte = gezogeneKarte;
        console.log("Server zieht Karte:", gezogeneKarte.name);
        // Schickt die Karte an ALLE
        io.emit('neue_karte', gezogeneKarte);
    });

    socket.on('disconnect', () => {
        console.log('Ein Spieler hat die Verbindung getrennt');
    });
});

// Port-Einstellungen für Render
const PORT = process.env.PORT || 3000;
http.listen(PORT, '0.0.0.0', () => {
    console.log('Tutto-Server läuft auf Port ' + PORT);
});

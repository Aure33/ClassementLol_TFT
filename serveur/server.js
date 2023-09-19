const express = require('express');
const fs = require('fs');
const cors = require('cors'); // Middleware pour gérer les demandes CORS
const app = express();
const port = 3000;

app.use(cors()); // Active CORS pour autoriser les demandes depuis le frontend

app.use(express.json()); // Middleware pour gérer les demandes JSON

app.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});

// Charger la liste de favoris depuis le fichier JSON
const chargerProfile = () => {
  try {
    const ProfileData = fs.readFileSync('./Profile.json', 'utf-8');
    return JSON.parse(ProfileData);
  } catch (error) {
    console.error('Erreur lors du chargement des favoris', error);
    return [];
  }
};

app.get('/api/profile', (req, res) => {
  const ProfileData = chargerProfile();
  res.json(ProfileData);
}
);






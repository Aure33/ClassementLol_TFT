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

app.post('/api/ajouter-compte', (req, res) => {
  const { nom,nomCompte,rank,tier,LP,CinqDerniersMatchs,dernierMatch,win,loose,puuid } = req.body;

  // Vérifie si le nom est déjà dans la liste de favoris
  const ProfileData = chargerProfile();
  const player = ProfileData.find((player) => player.nomCompte === nomCompte || player.puuid === puuid || player.nom === nom);

  if (player !== undefined) {
    res.status(400).json({ message: 'Le nom est déjà dans la liste de favoris' });
    return;
  }

  // Ajouter le nom à la liste de favoris
  ProfileData.push({
    nomCompte: nomCompte,
    puuid: puuid,
    LoL: {
      rank: rank,
      tier: tier,
      LP: LP,
      victoire: win,
      defaite: loose,
      ratio: (win / (win + loose)) * 100,
      CinqDerniersMatchs: CinqDerniersMatchs,
      dernierMatch: dernierMatch,
    }
  });

  fs.writeFileSync('./Profile.json', JSON.stringify(ProfileData));
  res.json(ProfileData);
});



app.post('/api/modifier-profil', (req, res) => {
  const { nom,rank,tier,LP,CinqDerniersMatchs,dernierMatch,win,loose,puuid } = req.body;

  // changer le profil du joueur
  const ProfileData = chargerProfile();
  // fin the player in the json who has the same name as the one in the request
  const player = ProfileData.find((player) => player.nomCompte === nom);

  console.log(player)
  if (puuid !== undefined) {

    player.puuid = puuid;
  }

  if (rank !== undefined) {
    player.LoL.rank = rank;
  }
  
  if (tier !== undefined) {
    player.LoL.tier = tier;
  }
  
  if (LP !== undefined) {
    player.LoL.LP = LP;
  }
  
  if (win !== undefined) {
    player.LoL.victoire += win;
  }
  
  if (loose !== undefined) {
    player.LoL.defaite += loose;
  }
  
  player.LoL.ratio = (player.LoL.victoire / (player.LoL.victoire + player.LoL.defaite)) * 100;
  
  if (CinqDerniersMatchs !== undefined) {
    player.LoL.CinqDerniersMatchs = CinqDerniersMatchs;
  }
  
  if (dernierMatch !== undefined) {
    player.LoL.dernierMatch = dernierMatch;
  }
  

  console.log("SIU")
  // Sauvegarder la liste de favoris dans le fichier JSON
  fs.writeFileSync('./Profile.json', JSON.stringify(ProfileData));
  res.json(ProfileData);
});






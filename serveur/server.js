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
  const { nom, nomCompte, jeux, puuid, dernierMatch, rank, tier, LP, CinqDerniersMatchs } = req.body;

  // Vérifie si le nom est déjà dans la liste de favoris
  const ProfileData = chargerProfile();
  let existingPlayerIndex = -1;
  const player = ProfileData.find((player, index) => {
    if (player.nomCompte === nomCompte || player.puuid === puuid || player.nom === nom) {
      existingPlayerIndex = index;
      return true;
    }
    return false;
  });

  if (player !== undefined) {
    // Le joueur existe déjà, vérifiez s'il a le jeu dans son profil
    if (jeux === 'lol' && !ProfileData[existingPlayerIndex].lol) {
      ProfileData[existingPlayerIndex].lol = {
        dernierMatch,
        rank,
        tier,
        LP,
        victoire: 0,
        defaite: 0,
        ratio: 1,
        classement: 0,
        CinqDerniersMatchs,
      };
    } else if (jeux === 'tft' && !ProfileData[existingPlayerIndex].tft) {
      return;
    } else {
      res.status(400).json({ message: 'Le joueur a déjà ce jeu dans son profil' });
      return;
    }
  } else {
    // Le joueur n'existe pas, ajoutez-le avec le jeu spécifié
    const newPlayer = {
      nom: nom,
      nomCompte: nomCompte,
      puuid: puuid,
    };

    if (dernierMatch !== undefined) {
      dernierMatch = "";
    }
    if(rank !== undefined) {
      rank = "Unranked";
    }
    if(tier !== undefined) {
      tier = "Unranked";
    }
    if(LP !== undefined) {
      LP = "Unranked";
    }
    if(CinqDerniersMatchs !== undefined) {
      CinqDerniersMatchs = [];
    }


    if (jeux === 'lol') {
      newPlayer.lol = {
        dernierMatch,
        rank,
        tier,
        LP,
        victoire: 0,
        defaite: 0,
        ratio: 1,
        classement: 0,
        CinqDerniersMatchs,
      };
    } else if (jeux === 'tft') {
    }

    ProfileData.push(newPlayer);
  }

  // Sauvegarder la liste de favoris dans le fichier JSON
  fs.writeFileSync('./Profile.json', JSON.stringify(ProfileData));
  res.json(ProfileData);
});




app.post('/api/modifier-profil', (req, res) => {
  const { nom,rank,tier,classement,LP,CinqDerniersMatchs,dernierMatch,win,loose,puuid } = req.body;

  // changer le profil du joueur
  const ProfileData = chargerProfile();
  // fin the player in the json who has the same name as the one in the request
  const player = ProfileData.find((player) => player.nomCompte === nom);

  if (puuid !== undefined) {

    player.puuid = puuid;
  }

  if (rank !== undefined) {
    player.lol.rank = rank;
  }
  
  if (tier !== undefined) {
    player.lol.tier = tier;
  }
  
  if (LP !== undefined) {
    player.lol.LP = LP;
  }
  
  if (win !== undefined) {
    player.lol.victoire += win;
  }
  
  if (loose !== undefined) {
    player.lol.defaite += loose;
  }

  if (classement !== undefined) {
    player.lol.classement = classement;
  }
  
  player.lol.ratio = (player.lol.victoire / (player.lol.victoire + player.lol.defaite)) * 100;
  
  if (CinqDerniersMatchs !== undefined) {
    player.lol.CinqDerniersMatchs = CinqDerniersMatchs;
  }
  
  if (dernierMatch !== undefined) {
    player.lol.dernierMatch = dernierMatch;
  }
  

  // Sauvegarder la liste de favoris dans le fichier JSON
  fs.writeFileSync('./Profile.json', JSON.stringify(ProfileData));
  res.json(ProfileData);
});

app.post('/api/supprimer-compte', (req, res) => {
  const { nomCompte } = req.body;

  // Supprimer le compte de la liste de favoris
  const ProfileData = chargerProfile();
  const newProfileData = ProfileData.filter((player) => player.nomCompte !== nomCompte);

  // Sauvegarder la liste de favoris dans le fichier JSON
  fs.writeFileSync('./Profile.json', JSON.stringify(newProfileData));
  res.json(newProfileData);
});

app.post('/api/modifier-classement', (req, res) => {
  const joueursTries = req.body;
  console.log(joueursTries);
  // Sauvegarder le classement trié dans le fichier JSON
  fs.writeFileSync('./Profile.json', JSON.stringify(joueursTries));
  res.json(joueursTries);
});





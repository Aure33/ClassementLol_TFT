const express = require("express");
const fs = require("fs");
const cors = require("cors"); // Middleware pour gérer les demandes CORS
const app = express();
const port = 3000;

const cron = require("node-cron");
const axios = require("axios");

const riotApiKey = "RGAPI-d7d2ccdd-3ac1-48c9-9a2b-d1bea7cc3bb1"; // Remplacez par votre clé API Riot Games

app.use(cors()); // Active CORS pour autoriser les demandes depuis le frontend

app.use(express.json()); // Middleware pour gérer les demandes JSON

app.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});

// Charger la liste de favoris depuis le fichier JSON
const chargerProfile = () => {
  try {
    const ProfileData = fs.readFileSync("./Profile.json", "utf-8");
    return JSON.parse(ProfileData);
  } catch (error) {
    console.error("Erreur lors du chargement des favoris", error);
    return [];
  }
};

app.get("/api/profile", (req, res) => {
  const ProfileData = chargerProfile();
  res.json(ProfileData);
});

app.post("/api/ajouter-compte", (req, res) => {
  let {
    nom,
    vraiNom,
    nomCompte,
    vraiNomCompte,
    jeux,
    puuid,
    dernierMatch,
    rank,
    tier,
    LP,
    CinqDerniersMatchs,
  } = req.body;

  console.log(req.body);
  // Vérifie si le nom est déjà dans la liste de favoris
  let ProfileData = chargerProfile();
  let existingPlayerIndex = -1;
  let player = ProfileData.find((player, index) => {
    if (
      player.nomCompte === nomCompte ||
      player.puuid === puuid ||
      player.nom === nom
    ) {
      existingPlayerIndex = index;
      return true;
    }
    return false;
  });

  if (player !== undefined) {
    // Le joueur existe déjà, vérifiez s'il a le jeu dans son profil
    if (jeux === "lol" && !ProfileData[existingPlayerIndex].lol) {
      ProfileData[existingPlayerIndex].lol = {
        dernierMatch,
        rank,
        tier,
        LP,
        victoire: 0,
        defaite: 0,
        ratio: 0,
        classement: 0,
        CinqDerniersMatchs,
      };
    } else if (jeux === "tft" && !ProfileData[existingPlayerIndex].tft) {
      return;
    } else {
      res
        .status(400)
        .json({ message: "Le joueur a déjà ce jeu dans son profil" });
      return;
    }
  } else {
    // Le joueur n'existe pas, ajoutez-le avec le jeu spécifié
    let newPlayer = {
      nom: nom,
      vraiNom: vraiNom,
      nomCompte: nomCompte,
      vraiNomCompte: vraiNomCompte,
      puuid: puuid,
    };

    if (dernierMatch === undefined) {
      dernierMatch = "";
    }
    if (rank === undefined) {
      rank = "Unranked";
    }
    if (tier === undefined) {
      tier = "Unranked";
    }
    if (LP === undefined) {
      LP = "Unranked";
    }
    if (CinqDerniersMatchs === undefined) {
      CinqDerniersMatchs = [];
    }

    if (jeux === "lol") {
      newPlayer.lol = {
        dernierMatch,
        rank,
        tier,
        LP,
        victoire: 0,
        defaite: 0,
        ratio: 0,
        classement: 0,
        CinqDerniersMatchs,
      };
    } else if (jeux === "tft") {
    }

    ProfileData.push(newPlayer);
  }

  // Sauvegarder la liste de favoris dans le fichier JSON
  fs.writeFileSync("./Profile.json", JSON.stringify(ProfileData));
  res.json(ProfileData);
});

app.post("/api/modifier-profil", (req, res) => {
  const {
    nom,
    rank,
    tier,
    classement,
    LP,
    CinqDerniersMatchs,
    dernierMatch,
    win,
    loose,
    puuid,
  } = req.body;

  console.log(req.body);
  // changer le profil du joueur
  const ProfileData = chargerProfile();
  // fin the player in the json who has the same name as the one in the request
  const player = ProfileData.find((player) => player.nomCompte === nom);

  if (puuid !== undefined) {
    player.puuid = puuid;
  } else {
    player.puuid = player.puuid;
  }

  if (rank !== undefined) {
    player.lol.rank = rank;
  } else {
    player.lol.rank = player.lol.rank;
  }

  if (tier !== undefined) {
    player.lol.tier = tier;
  } else {
    player.lol.tier = player.lol.tier;
  }

  if (LP !== undefined) {
    player.lol.LP = LP;
  } else {
    player.lol.LP = player.lol.LP;
  }

  if (win !== undefined) {
    player.lol.victoire += win;
  } else {
    player.lol.victoire = player.lol.victoire;
  }

  if (loose !== undefined) {
    player.lol.defaite += loose;
  } else {
    player.lol.defaite = player.lol.defaite;
  }

  if (classement !== undefined) {
    player.lol.classement = classement;
  } else {
    player.lol.classement = player.lol.classement;
  }

  player.lol.ratio =
    (player.lol.victoire / (player.lol.victoire + player.lol.defaite)) * 100;

  if (CinqDerniersMatchs !== undefined) {
    player.lol.CinqDerniersMatchs = CinqDerniersMatchs;
  } else {
    player.lol.CinqDerniersMatchs = player.lol.CinqDerniersMatchs;
  }

  if (dernierMatch !== undefined) {
    player.lol.dernierMatch = dernierMatch;
  } else {
    player.lol.dernierMatch = player.lol.dernierMatch;
  }

  // Sauvegarder la liste de favoris dans le fichier JSON
  fs.writeFileSync("./Profile.json", JSON.stringify(ProfileData));
  res.json(ProfileData);
});

app.post("/api/supprimer-compte", (req, res) => {
  const { nomCompte } = req.body;

  // Supprimer le compte de la liste de favoris
  const ProfileData = chargerProfile();
  const newProfileData = ProfileData.filter(
    (player) => player.nomCompte !== nomCompte
  );

  // Sauvegarder la liste de favoris dans le fichier JSON
  fs.writeFileSync("./Profile.json", JSON.stringify(newProfileData));
  res.json(newProfileData);
});

cron.schedule('*/1 * * * *', () => {
  console.log('Actualisation des données des joueurs en cours');
  getInfoPlayer();
  console.log('Actualisation des données des joueurs fais');
});

async function getInfoPlayer() {
  const ProfileData = chargerProfile();
  var data;
  for (const player of ProfileData) {
    if (player.lol) {
      data = await getLastRanked5x5Solo(
        player.nomCompte,
        player.lol.dernierMatch,
        player.lol.CinqDerniersMatchs
      );
      if (data) {
        player.lol.dernierMatch = data.dernierMatch;
        player.lol.CinqDerniersMatchs = data.CinqDerniersMatchs;
        player.lol.victoire += data.win;
        player.lol.defaite += data.loose;
        player.lol.ratio =
          (player.lol.victoire /
            (player.lol.victoire + player.lol.defaite)) *
          100;
      }
      fs.writeFileSync("./Profile.json", JSON.stringify(ProfileData));
    }
  }
}

async function getLastRanked5x5Solo(
  nomCompte,
  dernierMatch,
  CinqDerniersMatchs
) {
  try {
    const Profiles = await axios.get(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${nomCompte}?api_key=${riotApiKey}`
    );
    const summonerId = Profiles.data.id;
    const Ranked = await axios.get(
      `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotApiKey}`
    );
    const matchIDResponse = await axios.get(
      `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${Profiles.data.puuid}/ids?start=0&count=1&api_key=${riotApiKey}`
    );
    const matchIDs = matchIDResponse.data;
    var win = 0;
    var loose = 0;

    // look if this is a 5x5 ranked solo game
    const matchResponse = await axios.get(
      `https://europe.api.riotgames.com/lol/match/v5/matches/${matchIDs[0]}?api_key=${riotApiKey}`
    );
    const match = matchResponse.data;

    const queueType = match.info.queueId;
    if (queueType !== 420) {
      return null;
    }

    const participant = match.info.participants.find(
      (participant) => participant.puuid === Profiles.data.puuid
    );
    if (participant) {
      if (matchIDs[0] !== dernierMatch) {
        dernierMatch = matchIDs[0];
        if (participant.win) {
          win = 1;
          CinqDerniersMatchs.pop();
          for (let i = CinqDerniersMatchs.length - 1; i >= 0; i--) {
            CinqDerniersMatchs[i + 1] = CinqDerniersMatchs[i];
          }
          CinqDerniersMatchs[0] = true;
        } else {
          loose = 1;
          CinqDerniersMatchs.pop();
          for (let i = CinqDerniersMatchs.length - 1; i >= 0; i--) {
            CinqDerniersMatchs[i + 1] = CinqDerniersMatchs[i];
          }
          CinqDerniersMatchs[0] = true;
        }
      }
    }
    return { win, loose, CinqDerniersMatchs, dernierMatch};
  } catch (error) {
    console.error(error);
  }
}


function calculerClassement(player) {
  const rankOrder = {
      "Unranked": 0,
      "IRON": 1,
      "BRONZE": 2,
      "SILVER": 3,
      "GOLD": 4,
      "PLATINUM": 5,
      "EMERALD": 6,
      "DIAMOND": 7,
      "MASTER": 8,
      "GRANDMASTER": 9,
      "CHALLENGER": 10,
  };

  const tierOrder = {
      "Unranked": 0,
      "I": 4,
      "II": 3,
      "III": 2,
      "IV": 1,
  };

  const rankValue = rankOrder[player.lol.rank];
  const tierValue = tierOrder[player.lol.tier];
  const LPValue = player.lol.LP === "Unranked" ? 0 : parseInt(player.lol.LP);

  // Calcul du classement en fonction du rang, du tier et des LP
  return rankValue * 1000 + tierValue * 100 + LPValue;
}










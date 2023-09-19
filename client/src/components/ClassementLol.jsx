import {  useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
axios.defaults.baseURL = 'http://localhost:3000'; // Remplacez par l'URL de votre backend
const riotApiKey = ('RGAPI-d7d2ccdd-3ac1-48c9-9a2b-d1bea7cc3bb1');


function ClassementLol() {


    const chargementAPI = async () => {
        // const response = await axios.get('/api/profile');
        // setData(response.data);
    }

    useEffect(() => {
        chargementAPI();
    }, []);

    async function initPuuid() {
        try {
            // get all players
            const response = await axios.get('/api/profile');
            const players = response.data;

            // get all players puuid from the LoL API
            var puuid = [];
            for (var i = 0; i < players.length; i++) {
                const Profiles = await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + players[i].nomCompte + '?api_key=' + riotApiKey);
                puuid.push(Profiles.data.puuid);
            }

            console.log(puuid);

            // add the puuid to the json
            for (var y = 0; y < players.length; y++) {
                await axios.post('/api/modifier-profil', {
                    nom: players[y].nomCompte,
                    puuid: puuid[y]
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function addResult() {
        try {
            // get all players
            const response = await axios.get('/api/profile');
            const players = response.data;

            // get all players last gameID
            var lastGameID = [];
            for (var i = 0; i < players.length; i++) {
                lastGameID.push(players[i].LoL.dernierMatch);
                console.log("i");
            }

            // get all players last gameID from the LoL API
            var lastGameIDAPI = [];
            for (var y = 0; y < players.length; y++) {
                const Profiles = await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + players[y].nomCompte + '?api_key=' + riotApiKey);
                const matchIDResponse = await axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/' + Profiles.data.puuid + '/ids?start=0&count=1&api_key=' + riotApiKey);
                const matchIDs = matchIDResponse.data;
                lastGameIDAPI.push(matchIDs[0]);
            }

            // compare the two arrays
            for (var z = 0; z < players.length; z++) {
                if (lastGameID[z] !== lastGameIDAPI[z]) {
                    // get the result of the game
                    const matchResponse = await axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/' + lastGameIDAPI[z] + '?api_key=' + riotApiKey);
                    const match = matchResponse.data;

                    // Vérifiez si c'est un match en mode RANKED_SOLO_5x5
                    const queueType = match.info.queueId;
                    if (queueType !== 420) {
                        continue; // Passez au match suivant s'il n'est pas en RANKED_SOLO_5x5
                    }

                    const participant = match.info.participants.find(participant => participant.puuid === players[z].puuid);
                    console.log("dernieregame : " + lastGameIDAPI[z]);
                    // add the result of the game to the JSON
                    if (participant.win === true) {
                        await axios.post('/api/modifier-profil', {
                            nom: players[z].nomCompte,
                            win: 1,
                            dernierMatch: lastGameIDAPI[z]
                        });
                    } else {
                        await axios.post('/api/modifier-profil', {
                            nom: players[z].nomCompte,
                            loose: 1,
                            dernierMatch: lastGameIDAPI[z]
                        });
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function getInfoPlayer(data) {
        try {
            addResult();
            var nomCompte = data;

            const Profiles = await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + nomCompte + '?api_key=' + riotApiKey);
            const summonerId = Profiles.data.id;

            const Ranked = await axios.get('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + summonerId + '?api_key=' + riotApiKey);

            const matchIDResponse = await axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/' + Profiles.data.puuid + '/ids?start=0&count=20&api_key=' + riotApiKey);
            const matchIDs = matchIDResponse.data;

            var count = 0;
            var CinqDerniersMatchs = [];

            for (const matchID of matchIDs) {
                const matchResponse = await axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/' + matchID + '?api_key=' + riotApiKey);
                const match = matchResponse.data;

                // Vérifiez si c'est un match en mode RANKED_SOLO_5x5
                const queueType = match.info.queueId;
                if (queueType !== 420) {
                    continue;
                }

                // Obtenez l'ID du participant
                const participant = match.info.participants.find(participant => participant.puuid === Profiles.data.puuid);

                // Si le participant existe, vérifiez s'il a gagné ou perdu
                if (participant) {
                    if (participant.win === true) {
                        CinqDerniersMatchs.push(true)
                    } else {
                        CinqDerniersMatchs.push(false)
                    }
                    count += 1;
                    if (count >= 5) {
                        break;
                    }
                }
            }
            var rank = "Unranked";
            var tier = "Unranked";
            var LP = "Unranked";

            for (var y = 0; y < Ranked.data.length; y++) {
                if (Ranked.data[y].queueType === 'RANKED_SOLO_5x5') {
                    rank = Ranked.data[y].tier;
                    tier = Ranked.data[y].rank;
                    LP = Ranked.data[y].leaguePoints;
                    break;
                }
            }
            console.log("rank : " + rank);
            console.log("tier : " + tier);
            console.log("LP : " + LP);
            console.log("nomCompte : " + nomCompte);
            await axios.post('/api/modifier-profil', {
                nom: nomCompte,
                rank: rank,
                tier: tier,
                LP: LP,
                CinqDerniersMatchs: CinqDerniersMatchs
            });
            console.log("Finis");
        } catch (error) {
            console.error(error);
        }
    }


    return (
        <>
            <h1> LOL : League Of Legends {riotApiKey} </h1>

            <button onClick={() => initPuuid()}>Init puiid</button>
            <button onClick={() => getInfoPlayer("LordVauron")}>Get Info Player</button>
            <br></br>
            <Link to="/ClassementIUT/">Menu</Link>
        </>
    );
}

export default ClassementLol;
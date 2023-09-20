import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Tableau from './Tableau';

axios.defaults.baseURL = 'http://localhost:3000'; // Remplacez par l'URL de votre backend
const riotApiKey = 'RGAPI-d7d2ccdd-3ac1-48c9-9a2b-d1bea7cc3bb1';

function ClassementLol() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await axios.get('/api/profile');
                setData(result.data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchData();
    }, []);

    async function rechargerInformations() {
        try {
            setIsLoading(true);

            for (const player of data) {
                const classement = calculerClassement(player); // Calculer le classement
                console.log(classement + ' ' + player.nomCompte);
                await getInfoPlayer(player.nomCompte, classement); // Envoyer le classement à getInfoPlayer
            }
            const result = await axios.get('/api/profile');
            setData(result.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function getInfoPlayer(nomCompte, classement) {
        try {
            addResult();
            const Profiles = await axios.get(
                `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${nomCompte}?api_key=${riotApiKey}`
            );
            const summonerId = Profiles.data.id;
            const Ranked = await axios.get(
                `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotApiKey}`
            );
            const matchIDResponse = await axios.get(
                `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${Profiles.data.puuid}/ids?start=0&count=20&api_key=${riotApiKey}`
            );
            const matchIDs = matchIDResponse.data;
            var count = 0;
            var CinqDerniersMatchs = [];

            for (const matchID of matchIDs) {
                const matchResponse = await axios.get(
                    `https://europe.api.riotgames.com/lol/match/v5/matches/${matchID}?api_key=${riotApiKey}`
                );
                const match = matchResponse.data;

                const queueType = match.info.queueId;
                if (queueType !== 420) {
                    continue;
                }

                const participant = match.info.participants.find(
                    (participant) => participant.puuid === Profiles.data.puuid
                );

                if (participant) {
                    if (participant.win === true) {
                        CinqDerniersMatchs.push(true);
                    } else {
                        CinqDerniersMatchs.push(false);
                    }
                    count += 1;
                    if (count >= 5) {
                        break;
                    }
                }
            }
            var rank = 'Unranked';
            var tier = 'Unranked';
            var LP = 'Unranked';

            for (var y = 0; y < Ranked.data.length; y++) {
                if (Ranked.data[y].queueType === 'RANKED_SOLO_5x5') {
                    rank = Ranked.data[y].tier;
                    tier = Ranked.data[y].rank;
                    LP = Ranked.data[y].leaguePoints;
                    break;
                }
            }
            await axios.post('/api/modifier-profil', {
                nom: nomCompte,
                rank: rank,
                tier: tier,
                LP: LP,
                classement: classement, // Utiliser le classement calculé ici
                CinqDerniersMatchs: CinqDerniersMatchs,
            });
            console.log('Finis');
        } catch (error) {
            console.error(error);
        }
    }

    async function addResult() {
        try {
            const response = await axios.get('/api/profile');
            const players = response.data;

            var lastGameID = [];
            for (var i = 0; i < players.length; i++) {
                lastGameID.push(players[i].lol.dernierMatch);
                console.log('i');
            }

            var lastGameIDAPI = [];
            for (var y = 0; y < players.length; y++) {
                const Profiles = await axios.get(
                    `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${players[y].nomCompte}?api_key=${riotApiKey}`
                );
                const matchIDResponse = await axios.get(
                    `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${Profiles.data.puuid}/ids?start=0&count=1&api_key=${riotApiKey}`
                );
                const matchIDs = matchIDResponse.data;
                lastGameIDAPI.push(matchIDs[0]);
            }

            for (var z = 0; z < players.length; z++) {
                if (lastGameID[z] !== lastGameIDAPI[z]) {
                    const matchResponse = await axios.get(
                        `https://europe.api.riotgames.com/lol/match/v5/matches/${lastGameIDAPI[z]}?api_key=${riotApiKey}`
                    );
                    const match = matchResponse.data;

                    const queueType = match.info.queueId;
                    if (queueType !== 420) {
                        continue;
                    }

                    const participant = match.info.participants.find(
                        (participant) => participant.puuid === players[z].puuid
                    );
                    console.log('dernieregame : ' + lastGameIDAPI[z]);
                    if (participant.win === true) {
                        await axios.post('/api/modifier-profil', {
                            nom: players[z].nomCompte,
                            win: 1,
                            dernierMatch: lastGameIDAPI[z],
                        });
                    } else {
                        await axios.post('/api/modifier-profil', {
                            nom: players[z].nomCompte,
                            loose: 1,
                            dernierMatch: lastGameIDAPI[z],
                        });
                    }
                }
            }
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
            "I": 1,
            "II": 2,
            "III": 3,
            "IV": 4,
        };

        const rankValue = rankOrder[player.lol.rank] || 0;
        const tierValue = tierOrder[player.lol.tier] || 0;
        const LPValue = player.lol.LP === "Unranked" ? 0 : parseInt(player.lol.LP);

        // Calcul du classement en fonction du rang, du tier et des LP
        return rankValue * 100 + tierValue * 10 + LPValue;
    }

    return (
        <>
            <h1>Classement LoL</h1>
            <button onClick={rechargerInformations} disabled={isLoading}>
                {isLoading ? 'Chargement...' : 'Recharger'}
            </button>
            <br />
            <Tableau data={data} />
            <Link to="/ClassementIUT/">Menu</Link>
        </>
    );
}

export default ClassementLol;

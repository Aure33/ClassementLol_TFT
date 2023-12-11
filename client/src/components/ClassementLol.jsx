import { useEffect, useState, useRef  } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Tableau from './Tableau';

axios.defaults.baseURL = 'http://localhost:3000'; // Remplacez par l'URL de votre backend
const riotApiKey = 'RGAPI-d7d2ccdd-3ac1-48c9-9a2b-d1bea7cc3bb1';

function ClassementLol() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // Temps restant en secondes, initialisez à 60 pour une actualisation après 1 minute

    const intervalRef = useRef(null);

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

        // Démarrez l'intervalle pour rafraîchir toutes les minutes
        intervalRef.current = setInterval(() => {
            rechargerInformations();
        }, 120000); 

        // Nettoyez l'intervalle lors du démontage du composant
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

        // Fonction pour mettre à jour le temps restant toutes les secondes
        useEffect(() => {
            if (timeLeft > 0) {
                const timer = setInterval(() => {
                    setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
                }, 1000); // 1000 ms = 1 seconde
                return () => clearInterval(timer);
            }
        }, [timeLeft]);

    async function rechargerInformations() {
        try {
            setIsLoading(true);

            for (const player of data) {
                const classement = calculerClassement(player); // Calculer le classement
                console.log(classement + ' ' + player.nomCompte);
                await getInfoPlayer(player.nomCompte, classement, player.lol.dernierMatch); // Envoyer le classement à getInfoPlayer
            }
            const result = await axios.get('/api/profile');
            setData(result.data);
            setTimeLeft(120);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function getInfoPlayer(nomCompte, classement, dernierMatch) {
        try {
            var trouve = false;
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
                    if (trouve === false) {
                        if (matchID !== dernierMatch) {
                            console.log("test5");
                            if (participant.win === true) {
                                await axios.post('/api/modifier-profil', {
                                    nom: nomCompte,
                                    win: 1,
                                    dernierMatch: matchID,
                                });
                            } else {
                                await axios.post('/api/modifier-profil', {
                                    nom: nomCompte,
                                    loose: 1,
                                    dernierMatch: matchID,
                                });
                            }
                        }
                        trouve = true;
                    }
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
            var rank;
            var tier;
            var LP;

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
            alert("Calma l'API riot panique la");
            console.error(error);
            return;
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

    return (
        <>
            <h1>Classement LoL</h1>
            <p>Temps restant avant la prochaine actualisation : {timeLeft} secondes</p>
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

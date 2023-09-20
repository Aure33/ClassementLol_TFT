import '../css/App.css'
import { useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import AccountModal from './AjoutCompte'; // Assurez-vous d'importer correctement le composant
import PropTypes from 'prop-types';


function Menu() {
    const riotApiKey = ('RGAPI-d7d2ccdd-3ac1-48c9-9a2b-d1bea7cc3bb1');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nom, setNom] = useState('');
    const [nomCompte, setNomCompte] = useState('');
    const [jeux, setJeux] = useState('lol');

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleAddAccount = async (accountData) => {
        try {
            // mettre le nom et le nom du compte en minuscule, sans espace et sans accent.
            const nom = accountData.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "");
            const vraiNom = accountData.nom;
            const nomCompte = accountData.nomCompte.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "");
            const vraiNomCompte = accountData.nomCompte;
            const jeux = accountData.jeux;

            // Initialisation des variables
            var puuid;
            var dernierMatch;
            var rank;
            var tier;
            var LP;
            var CinqDerniersMatchs;

            const existingProfiles = await axios.get('/api/profile'); // Remplacez par votre endpoint API

            // Vérifier si le joueur existe déjà dans le jeu choisi
            
            if(jeux === 'lol'){
                for (const existingProfile of existingProfiles.data) {
                    if (existingProfile.nom === nom || existingProfile.nomCompte === nomCompte && existingProfile.lol) {
                        // Afficher un message d'erreur indiquant que le joueur a déjà un compte dans ce jeu
                        alert('Le joueur a déjà un compte dans ce jeu.');
                        return;
                    }
                }
            }else if(jeux === 'tft'){
                for (const existingProfile of existingProfiles.data) {
                    if (existingProfile.nom  === nom || existingProfile.nomCompte === nomCompte && existingProfile.tft) {
                        // Afficher un message d'erreur indiquant que le joueur a déjà un compte dans ce jeu
                        alert('Le joueur a déjà un compte dans ce jeu.');
                        return;
                    }
                }
            }

            if (jeux === 'lol') {
                // Obtenir les informations de base du joueur
                var summonerInfo;
                try{
                 summonerInfo = await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + nomCompte + '?api_key=' + riotApiKey);
                }catch(error){
                    alert('Le joueur n\'existe pas');
                    return;
                }
                puuid = summonerInfo.data.puuid;

                // Obtenir les informations de classement (rank) du joueur
                const rankedInfo = await axios.get('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + summonerInfo.data.id + '?api_key=' + riotApiKey);
                for (const entry of rankedInfo.data) {
                    if (entry.queueType === 'RANKED_SOLO_5x5') {
                        rank = entry.rank;
                        tier = entry.tier;
                        LP = entry.leaguePoints;
                        break;
                    }
                }

                // Obtenir les résultats des cinq derniers matchs
                const matchHistoryResponse = await axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids?start=0&count=20&api_key=' + riotApiKey);
                const matchIDsCinqDerniersMatchs = matchHistoryResponse.data;
                var trouve = false;
                CinqDerniersMatchs = [];
                for (const matchID of matchIDsCinqDerniersMatchs) {
                    const matchResponse = await axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/' + matchID + '?api_key=' + riotApiKey);
                    const match = matchResponse.data;

                    // Vérifiez si c'est un match en mode RANKED_SOLO_5x5
                    const queueType = match.info.queueId;
                    if (queueType !== 420) {
                        continue;
                    }
                    const participant = match.info.participants.find(participant => participant.puuid === puuid);

                    // Si le participant existe, vérifiez s'il a gagné ou perdu
                    if (participant) {
                        CinqDerniersMatchs.push(participant.win);
                        if (trouve === false) {
                            dernierMatch = matchID;
                            trouve = true;
                        }
                    }
                    if (CinqDerniersMatchs.length >= 5) {
                        break;
                    }
                }
            } else if (jeux === 'tft') {
                return;
            }

            await axios.post('/api/ajouter-compte', {
                nom: nom,
                vraiNom: vraiNom,
                nomCompte: nomCompte,
                vraiNomCompte: vraiNomCompte,
                jeux: jeux,
                puuid: puuid,
                dernierMatch: dernierMatch,
                rank: rank,
                tier: tier,
                LP: LP,
                CinqDerniersMatchs: CinqDerniersMatchs
            });
            // dire à l'utilisateur que le compte a été ajouté ou non
            alert('Le compte a été ajouté.');
            closeModal();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <h1> ClassementIUT </h1>
            <Link to="/ClassementIUT/LoL">  <button>Classement LoL</button></Link>
            <Link to="/ClassementIUT/TFT">  <button>Classement TFT</button></Link>
            <br></br>
            <button
                type="button"
                className="btn btn-primary"
                onClick={openModal}
            >
                Ajouter compte
            </button>

            {isModalOpen && (
                <AccountModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onAddAccount={handleAddAccount}
                    nom={nom}
                    setNom={setNom}
                    nomCompte={nomCompte}
                    setNomCompte={setNomCompte}
                    jeux={jeux}
                    setJeux={setJeux}
                />
            )}

            <h5>En partenariat avec<a href="https://edouardsence.github.io/tbm/"> TbHESS</a></h5>


        </>
    )
}
AccountModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAddAccount: PropTypes.func.isRequired,
    nom: PropTypes.string.isRequired,
    setNom: PropTypes.func.isRequired,
    nomCompte: PropTypes.string.isRequired,
    setNomCompte: PropTypes.func.isRequired,
    jeux: PropTypes.string.isRequired,
    setJeux: PropTypes.func.isRequired,
};
export default Menu

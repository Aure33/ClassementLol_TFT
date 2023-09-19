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

            console.log("-------SIUUU--------");
            console.log(accountData);

            const nom = accountData.nom;
            const nomCompte = accountData.nomCompte;
            const jeux = accountData.jeux;

            console.log(nom)
            console.log(jeux)
            if (jeux === 'lol') {
                const Profiles = await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + nomCompte + '?api_key=' + riotApiKey);
                const matchIDResponse = await axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/' + Profiles.data.puuid + '/ids?start=0&count=1&api_key=' + riotApiKey);
                console.log(matchIDResponse.data[0]);
            } else if (jeux === 'tft') {
                return;
            }






            await axios.post('/api/ajouter-compte', accountData);

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

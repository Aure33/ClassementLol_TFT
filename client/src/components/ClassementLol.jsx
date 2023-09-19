import axios from 'axios';

function ClassementLol() {
    const riotApiKey = ('RGAPI-d7d2ccdd-3ac1-48c9-9a2b-d1bea7cc3bb1');

    async function getInfoPlayer(data) {
        var nom = data.nomCompte
        var Profiles = await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + nom + '?api_key=' + riotApiKey);
        var Ranked = await axios.get('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + Profiles.data.id + '?api_key=' + riotApiKey);
    }


    return (
        <>
            <h1> LOL : League Of Legends {riotApiKey} </h1>
        </>
    )   
}

export default ClassementLol

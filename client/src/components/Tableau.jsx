import PropTypes from 'prop-types';

function Tableau(props) {
    // Copiez les données dans un nouveau tableau pour ne pas modifier l'original
    const sortedData = [...props.data];

    // Triez le tableau par classement (points) de manière décroissante
    sortedData.sort((a, b) => b.lol.classement - a.lol.classement);

    return (
        <table>
            <thead>
                <tr>
                    <th>Classement</th>
                    <th>Nom du Joueur</th>
                    <th>Nom du Compte</th>
                    <th>Rank, Tier, LP</th>
                    <th>Victoires</th>
                    <th>Défaites</th>
                    <th>Ratio</th>
                    <th>Cinq Derniers Matchs</th>
                </tr>
            </thead>
            <tbody>
                {sortedData.map((player, index) => (
                    <tr key={index}>
                        <td>
                            {player.lol.classement === 0 ? 'Non classé' : index + 1}
                        </td>
                        <td>{player.vraiNom}</td>
                        <td>{player.vraiNomCompte}</td>
                        <td>{`${player.lol.rank} ${player.lol.tier} ${player.lol.LP}`}</td>
                        <td>{player.lol.victoire}</td>
                        <td>{player.lol.defaite}</td>
                        <td>{player.lol.ratio}%</td>
                        <td>
                            <ul>
                                {player.lol.CinqDerniersMatchs.map((result, resultIndex) => (
                                    <li key={resultIndex}>{result ? 'Victoire' : 'Défaite'}</li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

Tableau.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        vraiNom: PropTypes.string.isRequired,
        vraiNomCompte: PropTypes.string.isRequired,
        lol: PropTypes.shape({
            rank: PropTypes.string.isRequired,
            tier: PropTypes.string.isRequired,
            LP: PropTypes.number.isRequired,
            victoire: PropTypes.number.isRequired,
            defaite: PropTypes.number.isRequired,
            ratio: PropTypes.number.isRequired,
            classement: PropTypes.number.isRequired,
            CinqDerniersMatchs: PropTypes.arrayOf(PropTypes.bool).isRequired,
        }).isRequired,
    })).isRequired,
};

export default Tableau;

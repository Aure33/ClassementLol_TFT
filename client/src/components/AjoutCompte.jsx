import PropTypes from 'prop-types';

function AccountModal({ isOpen, onClose, onAddAccount, nom, setNom, nomCompte, setNomCompte, jeux, setJeux }) {
    const handleAddAccount = () => {
        if (nom.trim() === '' || nomCompte.trim() === '') {
            alert('Veuillez remplir tous les champs.');
            return;
        }

        onAddAccount({
            nom,
            nomCompte,
            jeux
        });

        setNom('');
        setNomCompte('');
        setJeux('lol');
        onClose();
    };

    return (
        <div className={`modal ${isOpen ? 'show' : ''}`} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Ajouter un compte</h5>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="nom">Nom du joueur</label>
                            <input type="text" className="form-control" id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nomCompte">Nom du compte</label>
                            <input type="text" className="form-control" id="nomCompte" value={nomCompte} onChange={(e) => setNomCompte(e.target.value)} />
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="jeux" id="lol" value="lol" checked={jeux === 'lol'} onChange={() => setJeux('lol')} />
                            <label className="form-check-label" htmlFor="lol">LoL</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="jeux" id="tft" value="tft" checked={jeux === 'tft'} onChange={() => setJeux('tft')} />
                            <label className="form-check-label" htmlFor="tft">TFT</label>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={onClose}>Fermer</button>
                        <button type="button" className="btn btn-primary" onClick={handleAddAccount}>Ajouter</button>
                    </div>
                </div>
            </div>
        </div>
    );
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

export default AccountModal;

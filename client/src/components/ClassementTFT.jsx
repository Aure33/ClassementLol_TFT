import { Link } from "react-router-dom";
import { riotAPIKeyTFT } from "../../keys/keys";

function ClassementTFT() {
    return (
        <>
            <h1> TFT : TeamFight Tactics {riotAPIKeyTFT} </h1>
            <Link to="/ClassementIUT/">Menu</Link>
        </>
    )
}

export default ClassementTFT

import { Link } from "react-router-dom";

function ClassementTFT() {
    const riotApiKeyTFT = ('RGAPI-9be7583c-f892-48c2-9401-15eb37720010');
    return (
        <>
            <h1> TFT : TeamFight Tactics {riotApiKeyTFT} </h1>
            <Link to="/ClassementIUT/">Menu</Link>
        </>
    )
}

export default ClassementTFT

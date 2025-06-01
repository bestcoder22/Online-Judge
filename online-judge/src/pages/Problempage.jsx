import { useParams } from "react-router-dom";
import Compiler from "../components/Compiler";
import Navbar from "../components/Navbar";

const Problempage = () => {
    const {problemid} = useParams();
    return(
        <div>
            <Navbar />
            <Compiler problemid={problemid} />
        </div>
    )
}

export default Problempage;
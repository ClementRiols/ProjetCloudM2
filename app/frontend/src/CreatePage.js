import { Link, useNavigate } from "react-router-dom";
import CreateAnnonce from "./CreateAnnonce";

function CreatePage() {
  const navigate = useNavigate();

  const handleCreated = () => {
    navigate("/annonces"); // redirige vers la liste après création
  };

  return (
    <div className="page">
      <div className="page-top">
        <Link to="/" className="back-home">← Retour à l’accueil</Link>
      </div>

      <CreateAnnonce onCreated={handleCreated} />
    </div>
  );
}

export default CreatePage;
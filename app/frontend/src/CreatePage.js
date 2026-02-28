import { useNavigate } from "react-router-dom";
import CreateAnnonce from "./CreateAnnonce";

function CreatePage() {
  const navigate = useNavigate();

  const handleCreated = () => {
    navigate("/annonces"); // redirige vers la liste après création
  };

  return (
    <div className="page-container"> 
      <CreateAnnonce onCreated={handleCreated} />
    </div>
  );
}

export default CreatePage;
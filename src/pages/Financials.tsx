
import { useParams } from "react-router-dom";

const Financials = () => {
  const { ticker } = useParams();
  
  return (
    <div>
      <h1>Financials for {ticker}</h1>
    </div>
  );
};

export default Financials;

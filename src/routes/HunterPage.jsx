import { useNavigate } from "react-router-dom";
import HunterConsole from "../components/Hunter/HunterConsole";

export default function HunterPage() {
  const navigate = useNavigate();
  return (
    <HunterConsole
      onOpenFinding={(finding) =>
        navigate(`/findings/${finding.id}`, { state: { finding } })
      }
    />
  );
}

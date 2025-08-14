import LogoLoader from "../Loader/LogoLoader"; 
import VibeGramLogo from "../../../assets/images/VibeGramLogo.png";     

export default function Loader() {
  return <LogoLoader src={VibeGramLogo} size={160} duration="1s" fullScreen style={{ background: "transparent" }}/>;
}

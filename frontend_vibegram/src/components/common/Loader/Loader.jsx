// Loader.jsx
import LogoLoader from "../Loader/LogoLoader"; // путь к компоненту
import VibeGramLogo from "../../../assets/images/VibeGramLogo.png";     // <-- твой логотип

export default function Loader() {
  return <LogoLoader src={VibeGramLogo} size={160} duration="1s" fullScreen style={{ background: "transparent" }}/>;
}

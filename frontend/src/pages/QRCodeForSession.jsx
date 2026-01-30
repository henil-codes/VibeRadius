import QRCode from "react-qr-code";
import useSessionStore from "../store/sessionStore.js";

const QRCodeForSession = () => {
    const { activeSessionCode } = useSessionStore();
    const url = new URL(window.location.origin + `/customer/${activeSessionCode}`);
  return <QRCode value={url.toString()} title="Session QR Code" style={{height: "auto", width: "40%", margin: "0 auto"}} size={256} />;
}

export default QRCodeForSession;
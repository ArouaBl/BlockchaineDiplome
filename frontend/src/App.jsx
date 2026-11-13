
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import TestHash from "./utils/TestHash";
import ConnexionWallet from "./components/ConnexionWallet";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/verify" element={<Verify />} />

        {/* Test SHA-256 */}
        <Route path="/test-hash" element={<TestHash />} />

        {/* Test connexion MetaMask */}
        <Route path="/wallet" element={<ConnexionWallet />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

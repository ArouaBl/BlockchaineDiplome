
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Verify from "./pages/Verify";
import TestHash from "./utils/TestHash";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/verify" element={<Verify />} />

        {/* Route temporaire pour tester SHA-256 */}
        <Route path="/test-hash" element={<TestHash />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

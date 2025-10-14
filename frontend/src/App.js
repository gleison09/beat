import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DrumRudimentsApp from "./components/DrumRudimentsApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal */}
        <Route path="/" element={<DrumRudimentsApp />} />

        {/* Rota alternativa para /beat */}
        <Route path="/beat" element={<DrumRudimentsApp />} />

        {/* Redirecionamento de /beat para / */}
        {/* <Route path="/beat" element={<Navigate to="/" />} /> */}

        {/* Rota coringa */}
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

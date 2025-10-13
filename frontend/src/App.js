import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DrumRudimentsApp from "./components/DrumRudimentsApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota principal */}
        <Route path="/" element={<DrumRudimentsApp />} />

        {/* Rota alternativa para /beat, se quiser acessar diretamente */}
        <Route path="/beat" element={<DrumRudimentsApp />} />

        {/* Redirecionamento automático de /beat para / */}
        {/* <Route path="/beat" element={<Navigate to="/" />} /> */}

        {/* Rota coringa para evitar tela branca */}
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

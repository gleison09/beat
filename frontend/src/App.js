import React from "react";
<<<<<<< HEAD
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
=======
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
>>>>>>> 39a755aa9498edc15ee779af1bcee4b16eed489b
import DrumRudimentsApp from "./components/DrumRudimentsApp";

function App() {
  return (
<<<<<<< HEAD
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
=======
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DrumRudimentsApp />} />
        </Routes>
      </BrowserRouter>
    </div>
>>>>>>> 39a755aa9498edc15ee779af1bcee4b16eed489b
  );
}

export default App;

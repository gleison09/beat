import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DrumRudimentsApp from "./components/DrumRudimentsApp";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DrumRudimentsApp />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
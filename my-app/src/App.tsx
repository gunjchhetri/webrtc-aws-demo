import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Default } from "./pages/default";
import { Chat } from "./pages/chat";
import { Header } from "./components/header";
import { SocketProvider } from "./contexts/socketContext";

function App() {
  return (
    <div className="App">
      <Header></Header>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Default />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Router>
      </SocketProvider>
    </div>
  );
}

export default App;

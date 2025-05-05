import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/webchat" element={<ChatBot />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatBot from "./components/ChatBot";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<ChatBot />} />
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import "./styles.css";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/signup" className="nav-link">Sign Up</Link> |
          <Link to="/login" className="nav-link">Login</Link>
        </nav>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
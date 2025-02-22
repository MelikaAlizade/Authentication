import { useState } from "react";
import axios from "axios";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/signup", { email, password });
            if (response.data.success) {
                setMessage("Sign Up successful! Please log in.");
            }
        } catch (error) {
            setMessage("An error occurred during sign up.");
        }
    };

    return (
        <div className="container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Sign Up</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default Signup;
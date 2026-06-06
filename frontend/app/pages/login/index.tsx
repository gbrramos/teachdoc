import { useState } from "react";
import { Form, useNavigate } from "react-router";
import Button from "~/components/Button";
import Input from "~/components/Input";
import { authenticate } from "~/services/login-service";

export default function Login() {

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value);
    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        try {
            const token = await authenticate(name, password);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('token', token);
            }
            navigate('/home');
        } catch {
            setError("Invalid credentials. Please try again.");
        }
    }

    const handleNavigateToRegister = () => {
        navigate('/register');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded shadow-md justify-start">
                <h1 className="text-2xl font-bold text-black mb-4">TeachDoc</h1>
                <Form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Input type="text" onChange={handleNameChange} placeholder="Enter your username" />
                    </div> 
                    <div className="mb-4">
                        <Input type="password" onChange={handlePasswordChange} placeholder="Enter your password" />
                    </div> 
                    <div className="flex justify-between">
                        <Button type="submit">Login</Button>
                        <Button type="button" variant="secondary" onClick={handleNavigateToRegister}>Registrar</Button>
                    </div>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </Form>
            </div>
        </div>
    );
}
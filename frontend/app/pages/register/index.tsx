import {type ChangeEvent, type FormEvent, type FormEventHandler, type SubmitEventHandler, useState} from "react";
import { Form, useNavigate } from "react-router";
import Button from "~/components/Button";
import Input from "~/components/Input";
import { register } from "~/services/login-service";

export default function Login() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError("");

        try {
            await register(name, email, password);
            navigate('/login');
        } catch {
            setError("Failed to create account. Please try again.");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded shadow-md justify-start">
                <h1 className="text-2xl font-bold text-black mb-4">TeachDoc/Register</h1>
                <Form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label>Email</label>
                        <Input type="text" onChange={(e) => setEmail(e.target.value) } placeholder="Enter your email" />
                    </div>
                    <div className="mb-4">
                        <label>Username</label>
                        <Input type="text" onChange={(e) => setName(e.target.value)} placeholder="Enter your username" />
                    </div>
                    <div className="mb-4">
                        <label>Password</label>
                        <Input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                    </div>
                    <div className="flex justify-between">
                        <Button type="submit">Create</Button>
                        <Button type={"button"} variant="secondary" onClick={() => navigate('/login')}>Back to Login</Button>
                    </div>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </Form>
            </div>
        </div>
    );
}
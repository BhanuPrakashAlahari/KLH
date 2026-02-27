import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/ui/login-form";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Handle Google Callback
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
            handleGoogleCallback(code);
        }
    }, [window.location.search]);

    const handleGoogleCallback = async (code: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/auth/google/callback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ code }),
            });

            if (response.ok) {
                const data = await response.json();
                const token = typeof data === "string" ? data : (data.access_token || data.token);

                if (token) {
                    localStorage.setItem("access_token", token);
                    localStorage.setItem("token_type", "bearer");
                    navigate("/home");
                } else {
                    setError("Could not retrieve access token.");
                }
            } else {
                setError("Google authentication failed. Please try again.");
            }
        } catch (err) {
            setError("Network error during Google login.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/auth/google/login`, {
                method: "POST",
            });

            if (response.ok) {
                const data = await response.json();
                const redirectUrl = typeof data === "string" ? data : (data.url || data.authorization_url);

                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    setError("Invalid response from Google Login service.");
                }
            } else {
                setError("Could not initialize Google Login.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        role: "user",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (isLogin) {
            try {
                const formDataUrlEncoded = new URLSearchParams();
                formDataUrlEncoded.append("username", formData.username);
                formDataUrlEncoded.append("password", formData.password);
                formDataUrlEncoded.append("grant_type", "password");

                const response = await fetch(`${BACKEND_URL}/auth/token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formDataUrlEncoded,
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("access_token", data.access_token);
                    localStorage.setItem("token_type", data.token_type);
                    navigate("/home");
                } else {
                    const errData = await response.json();
                    setError(errData.detail || "Authentication failed.");
                }
            } catch (err) {
                setError("Network error.");
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const response = await fetch(`${BACKEND_URL}/auth/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    setError("Signup successful! Please login.");
                    setIsLogin(true);
                } else {
                    const errData = await response.json();
                    setError(errData.detail?.[0]?.msg || "Signup failed.");
                }
            } catch (err) {
                setError("Network error.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <LoginForm
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            loading={loading}
            error={error}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
        />
    );
};

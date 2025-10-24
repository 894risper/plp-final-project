"use client";

import { useRouter } from "next/navigation";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (user: any) => {
        console.log("Logged in user:", user);
        // Navigate to landing page
        router.push("/landing");
    };

    return <LoginForm onLogin={handleLogin} />;
}

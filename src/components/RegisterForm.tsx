"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/lib/firebaseUtils"

interface RegisterFormProps {
    imageLink: string
}

export default function RegisterForm({ imageLink }: RegisterFormProps) {
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!name || !username || !email || !password) {
            setError("All fields are required")
            return
        }

        // Here you would typically send a request to your API to register the user
        // For demonstration, we'll just log the data and redirect
        // console.log("Registration data:", { name, username, email, password, imageLink })

        const newUser = {
            nombre: name,
            usuario: username,
            email: email,
            clave: password,
            linkImg: imageLink,
            rolSistema: 'User'
        }

        const response = await registerUser(newUser)

        if (response) {
            console.log('Usuario registrado:', response)
            router.push("/auth/singin") // Redirect to login page after successful registration
        }
        else {
            console.error('Error al registrar usuario')
        }

        // Simulate successful registration

    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="johndoe123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
                Register
            </Button>
        </form>
    )
}


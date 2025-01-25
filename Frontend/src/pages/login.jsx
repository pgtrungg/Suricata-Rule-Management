import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import Logo from "../assets/logo.png"; // Ensure the path is correct
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../redux/userSlice';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('/auth/login', { username, password });
            console.log(res.data.user);
            dispatch(login(res.data.user)); // Dispatch login action
            navigate('/rules'); // Navigate to home page
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || 'An error occurred. Please try again.';
            toast.error(errorMessage); // Error toast
            console.error(err);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword); // Toggle password visibility
    };

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            {/* Logo */}
            <img src={Logo} alt="Logo" className="w-36 h-36 mb-6 mt-4" />
            {/* Welcome message */}
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                Welcome to Suricata Management
            </h2>

            {/* Login form */}
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username Input */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
                            placeholder="Enter your username"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"} // Toggle visibility
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full px-4 py-2 mt-1 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility} // Toggle visibility
                                className="absolute inset-y-0 right-2 flex items-center text-gray-500 focus:outline-none"
                            >
                                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

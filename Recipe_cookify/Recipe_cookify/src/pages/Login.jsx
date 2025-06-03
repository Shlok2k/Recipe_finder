import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login data:', formData);
    };

    const handleFacebookLogin = () => {
        if (window.FB) {
            window.FB.login(function(response) {
                if (response.authResponse) {
                    console.log('Welcome!  Fetching your information.... ');
                    window.FB.api('/me', { fields: 'name,email' }, function(response) {
                        console.log('Good to see you, ' + response.name + '.');
                        // Here you would typically send the authResponse or user info to your backend
                        // for verification and actual login/signup.
                        console.log('Facebook login response:', response);
                    });
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            }, {scope: 'email,public_profile'}); // Request email and public profile permissions
        } else {
            console.log('Facebook SDK not loaded.');
            // Optionally, guide the user on how to load the SDK
            alert('Facebook SDK not loaded. Please check your integration.');
        }
    };

    const handleGoogleLogin = () => {
        if (window.google) {
            const client = window.google.accounts.oauth2.initOAuth2Only({
                client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
                scope: 'email profile',
                redirect_uri: 'YOUR_REDIRECT_URI', // Replace with your redirect URI
                response_type: 'code',
                state: 'YOUR_STATE_STRING', // Replace with a unique state string
                ux_mode: 'popup', // Or 'redirect'
                callback: (response) => {
                    console.log('Google login response:', response);
                    // Here you would typically send the authorization code (response.code) to your backend
                    // for verification and actual login/signup.
                },
            });
        } else {
            console.log('Google SDK not loaded.');
            // Optionally, guide the user on how to load the SDK
            alert('Google SDK not loaded. Please check your integration.');
        }
    };

    return (
        <div className="auth-container">
            <div className="welcome-section">
                <h1>Welcome back</h1>
                <p>
                    Discover delicious recipes and cooking inspiration on Recipe Hub.
                </p>
            </div>
            <div className="auth-box">
                <h2>Sign In</h2>
                <p className="subtitle">Don't have an account? <Link to="/signup">Sign Up</Link></p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-footer">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" className="auth-button">
                        Sign In
                    </button>
                </form>

                <div className="divider">
                    <span>or</span>
                </div>

                <div className="social-login">
                    <button className="social-button google" onClick={handleGoogleLogin}>
                        <i className="fab fa-google"></i> Google
                    </button>
                    <button className="social-button facebook" onClick={handleFacebookLogin}>
                         <i className="fab fa-facebook-f"></i> Facebook
                    </button>
                </div>

                <p className="copyright">Copyright © 2021-2023 AJI</p>

            </div>
        </div>
    );
};

export default Login; 
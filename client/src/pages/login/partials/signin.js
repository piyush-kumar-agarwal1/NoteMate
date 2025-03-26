import React from 'react'
import styles from './partials.module.scss';
import Input from '../../../components/atoms/input';
import Button from '../../../components/atoms/button';
import utils from '../../../utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the API base URL configuration
import API_BASE_URL from '../../../apis/config.js';

function Signin(props) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const navigate = useNavigate();

    const handleSignin = () => {
        // Validate form
        if (!email.trim() || !password.trim()) {
            toast.error('Email and password are required');
            return;
        }

        setIsLoading(true);

        // Use dynamic API_BASE_URL instead of hard-coded URL
        fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data?.success === 201) {
                    toast.success('User logged in successfully!');

                    // Store the token
                    utils.addToLocalStorage('auth_key', data.token);

                    // Store user ID for note ownership verification
                    if (data.id || data.userId) {
                        utils.addToLocalStorage('user_id', data.id || data.userId);
                    }

                    // Navigate to notes page
                    navigate('/notes');
                } else {
                    toast.error(data?.message || 'Login failed');
                }
            })
            .catch((err) => {
                console.error('Login error:', err);
                toast.error('Login failed. Please check your connection and try again.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return (
        <div className={styles.form}>
            <Button text={'Join With Google'} icon={'ri:google-fill'} />
            <div className={styles.option}><span>Or Join With Email</span></div>
            <article>
                <Input
                    type={'email'}
                    value={email}
                    placeholder={'Enter Email'}
                    onChange={(e) => setEmail(e.target.value)}
                    isDisabled={isLoading}
                />

                <Input
                    type={'password'}
                    value={password}
                    placeholder={'Enter Password'}
                    onChange={(e) => setPassword(e.target.value)}
                    isDisabled={isLoading}
                />

                <Button
                    text={isLoading ? 'Signing in...' : 'Join With Email'}
                    icon={'material-symbols:login'}
                    className={styles.emailBtn}
                    handleClick={handleSignin}
                    isDisbled={isLoading}
                />
            </article>
        </div>
    )
}

export default Signin
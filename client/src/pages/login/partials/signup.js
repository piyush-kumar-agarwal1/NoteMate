import React from 'react'
import styles from './partials.module.scss';
import Input from '../../../components/atoms/input';
import Button from '../../../components/atoms/button';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import API base URL from config file
import API_BASE_URL from '../../../apis/config.js';

function Signup(props) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSignup = () => {
        // Fixed validation logic: use || instead of && to check if any field is empty
        if (!email.trim() || !password.trim() || !name.trim()) {
            toast.error('All fields are required');
            return; // Added return to prevent continuing with invalid form
        }

        setIsLoading(true);

        // Use dynamic API_BASE_URL instead of hard-coded URL
        fetch(`${API_BASE_URL}/users/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data?.success === 201) {
                    toast.success('Signup successful!');
                    props.handleSwitch();
                } else {
                    toast.error(data?.message || 'Signup failed. Please try again.');
                }
            })
            .catch((err) => {
                console.error('Signup error:', err);
                toast.error('Signup failed. Please check your connection and try again.');
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
                    type={'text'} // Changed from 'name' to 'text' (HTML standard)
                    value={name}
                    placeholder={'Enter Full Name'}
                    onChange={(e) => setName(e.target.value)}
                    isDisabled={isLoading}
                />

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
                    text={isLoading ? 'Creating Account...' : 'Join With Email'}
                    icon={'material-symbols:login'}
                    className={styles.emailBtn}
                    handleClick={handleSignup}
                    isDisbled={isLoading} // Added to prevent multiple clicks
                />
            </article>
        </div>
    )
}

export default Signup
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import BrandLogo from '../../components/shared/brand';
import LoginImg from '../../assets/login.png';
import utils from '../../utils/localStorage';

import styles from './login.module.scss';

function Login() {
  const [activeTab, setActiveTab] = useState('signin');
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = utils.getFromLocalStorage('auth_key');
    if (token) {
      navigate('/notes');
    }

    // Initial animation
    const timer = setTimeout(() => {
      document.querySelector(`.${styles.loginContainer}`).classList.add(styles.loaded);
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  const switchTab = (tab) => {
    if (tab === activeTab) return;

    setIsAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setFormData({
        name: '',
        email: '',
        password: ''
      });
      setFormErrors({});
      setIsAnimating(false);
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (activeTab === 'signup' && !formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // In the handleSignin function, add storing the user's name:

  const handleSignin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data?.success === 201) {
        toast.success('Successfully logged in!');

        // CHANGE: Store auth data in sessionStorage only (not localStorage)
        utils.addToSessionStorage('auth_key', data.token);
        utils.addToSessionStorage('user_id', data.userId || data._id || Date.now().toString());

        // Store user name in sessionStorage
        try {
          const userResponse = await fetch('http://localhost:3001/api/users/me', {
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });

          const userData = await userResponse.json();
          if (userData && userData.name) {
            utils.addToSessionStorage('user_name', userData.name);
          } else {
            utils.addToSessionStorage('user_name', formData.email.split('@')[0]);
          }
        } catch (err) {
          utils.addToSessionStorage('user_name', formData.email.split('@')[0]);
        }

        // Continue with redirect
        document.querySelector(`.${styles.formPanel}`).classList.add(styles.success);
        setTimeout(() => {
          navigate('/notes');
        }, 800);
      } else {
        toast.error(data?.message || 'Login failed');
        document.querySelector(`.${styles.formPanel}`).classList.add(styles.error);
        setTimeout(() => {
          document.querySelector(`.${styles.formPanel}`).classList.remove(styles.error);
        }, 600);
      }
    } catch (err) {
      toast.error('Unable to connect to server');
      document.querySelector(`.${styles.formPanel}`).classList.add(styles.error);
      setTimeout(() => {
        document.querySelector(`.${styles.formPanel}`).classList.remove(styles.error);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  // In the handleSignup function:

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data?.success === 201) {
        toast.success('Account created successfully!');

        // Now automatically log the user in after signup
        const loginResponse = await fetch('http://localhost:3001/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const loginData = await loginResponse.json();

        if (loginData?.success === 201) {
          // Store auth data in sessionStorage instead of localStorage
          utils.addToSessionStorage('auth_key', loginData.token);
          utils.addToSessionStorage('user_id', loginData.userId || loginData._id);
          utils.addToSessionStorage('user_name', formData.name);

          // Set first login flag for welcome tour
          utils.addToSessionStorage('welcome_tour', Date.now().toString());

          // Show success animation
          document.querySelector(`.${styles.formPanel}`).classList.add(styles.success);

          // Redirect to notes page
          setTimeout(() => {
            navigate('/notes?welcome=true');
          }, 800);
        } else {
          // If auto-login fails, redirect to sign-in tab
          toast.info('Please sign in with your new account');
          document.querySelector(`.${styles.formPanel}`).classList.add(styles.success);
          setTimeout(() => {
            switchTab('signin');
            document.querySelector(`.${styles.formPanel}`).classList.remove(styles.success);
          }, 800);
        }
      } else {
        toast.error(data?.message || 'Signup failed');
        document.querySelector(`.${styles.formPanel}`).classList.add(styles.error);
        setTimeout(() => {
          document.querySelector(`.${styles.formPanel}`).classList.remove(styles.error);
        }, 600);
      }
    } catch (err) {
      toast.error('Unable to connect to server');
      document.querySelector(`.${styles.formPanel}`).classList.add(styles.error);
      setTimeout(() => {
        document.querySelector(`.${styles.formPanel}`).classList.remove(styles.error);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <ToastContainer position="top-right" theme="light" />

      <div className={styles.loginContainer}>
        {/* Left side with illustration */}
        <div className={styles.illustrationPanel}>
          <div className={styles.brandContainer}>
            <BrandLogo />
          </div>

          <div className={styles.illustrationWrapper}>
            <img src={LoginImg} alt="Login" className={styles.illustration} />
            <div className={styles.floatingShape1}></div>
            <div className={styles.floatingShape2}></div>
            <div className={styles.floatingShape3}></div>
          </div>

          <div className={styles.textContent}>
            <h1>Keep life simple</h1>
            <p>Store all your notes in a simple and intuitive app that helps you enjoy what is most important in life.</p>
          </div>
        </div>

        {/* Right side with form */}
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'signin' ? styles.active : ''}`}
                onClick={() => switchTab('signin')}
                disabled={isAnimating || isLoading}
              >
                Sign In
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'signup' ? styles.active : ''}`}
                onClick={() => switchTab('signup')}
                disabled={isAnimating || isLoading}
              >
                Sign Up
              </button>
              <div className={`${styles.tabIndicator} ${styles[activeTab]}`}></div>
            </div>

            {/* Form container with sliding animation */}
            <div className={`${styles.formsWrapper} ${isAnimating ? styles.animating : ''}`}>
              {/* Sign In Form */}
              {activeTab === 'signin' && (
                <form className={styles.form} onSubmit={handleSignin}>
                  <h2>Welcome Back</h2>
                  <p className={styles.subtitle}>Please enter your details to sign in</p>

                  <div className={styles.formGroup}>
                    <div className={`${styles.inputGroup} ${formErrors.email ? styles.error : ''}`}>
                      <Icon icon="mdi:email-outline" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.email && <div className={styles.errorText}>{formErrors.email}</div>}
                  </div>

                  <div className={styles.formGroup}>
                    <div className={`${styles.inputGroup} ${formErrors.password ? styles.error : ''}`}>
                      <Icon icon="mdi:lock-outline" />
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.password && <div className={styles.errorText}>{formErrors.password}</div>}
                  </div>

                  <div className={styles.forgotPassword}>
                    <a href="#reset">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className={styles.loadingSpinner}><Icon icon="svg-spinners:6-dots-scale" /></span>
                    ) : (
                      <>Sign In</>
                    )}
                  </button>

                  <div className={styles.divider}>
                    <span>or continue with</span>
                  </div>

                  <div className={styles.socialButtons}>
                    <button type="button" className={styles.socialButton}>
                      <Icon icon="flat-color-icons:google" />
                    </button>
                    <button type="button" className={styles.socialButton}>
                      <Icon icon="logos:github-icon" />
                    </button>
                  </div>
                </form>
              )}

              {/* Sign Up Form */}
              {activeTab === 'signup' && (
                <form className={styles.form} onSubmit={handleSignup}>
                  <h2>Create Account</h2>
                  <p className={styles.subtitle}>Please fill in the details to get started</p>

                  <div className={styles.formGroup}>
                    <div className={`${styles.inputGroup} ${formErrors.name ? styles.error : ''}`}>
                      <Icon icon="mdi:account-outline" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.name && <div className={styles.errorText}>{formErrors.name}</div>}
                  </div>

                  <div className={styles.formGroup}>
                    <div className={`${styles.inputGroup} ${formErrors.email ? styles.error : ''}`}>
                      <Icon icon="mdi:email-outline" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.email && <div className={styles.errorText}>{formErrors.email}</div>}
                  </div>

                  <div className={styles.formGroup}>
                    <div className={`${styles.inputGroup} ${formErrors.password ? styles.error : ''}`}>
                      <Icon icon="mdi:lock-outline" />
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {formErrors.password && <div className={styles.errorText}>{formErrors.password}</div>}
                    <div className={styles.passwordStrengthHint}>
                      Password must be at least 6 characters
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className={styles.loadingSpinner}><Icon icon="svg-spinners:6-dots-scale" /></span>
                    ) : (
                      <>Create Account</>
                    )}
                  </button>

                  <div className={styles.termsAgreement}>
                    By signing up, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
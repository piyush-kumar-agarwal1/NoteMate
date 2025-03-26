import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loader from '../components/shared/loader';
import styles from './layout.module.scss';
import Sidebar from '../components/shared/sidebar';
import Navbar from '../components/shared/navbar';
import utils from '../utils/localStorage';

function Main() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check BOTH sessionStorage and localStorage for a token
    const token = sessionStorage.getItem('auth_key') || utils.getFromLocalStorage('auth_key');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // This function is passed to Navbar to handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    utils.addToLocalStorage('search_term', term);
  };

  // Trigger refresh from sidebar
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<Loader />}>
        <Sidebar onRefresh={triggerRefresh} />
        <div className={styles.main}>
          <Navbar onSearch={handleSearch} />
          <section className={styles.content}>
            <Outlet context={{ searchTerm, refreshTrigger, triggerRefresh }} />
          </section>
        </div>
      </Suspense>
    </main>
  );
}

export default Main;
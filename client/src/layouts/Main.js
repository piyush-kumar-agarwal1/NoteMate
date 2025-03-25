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

  useEffect(() => {
    const token = utils.getFromLocalStorage('auth_key');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // This function is passed to Navbar to handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    utils.addToLocalStorage('search_term', term);
  };

  return (
    <main className={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<Loader />}>
        <Sidebar />
        <div className={styles.main}>
          <Navbar onSearch={handleSearch} />
          <section className={styles.content}>
            <Outlet context={{ searchTerm }} />
          </section>
        </div>
      </Suspense>
    </main>
  );
}

export default Main;
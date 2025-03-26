import React from 'react';
import styles from './greeting.module.scss';
import utils from '../../../utils/localStorage';

function Greeting() {
  // CHANGE: Use getUserName helper which prioritizes sessionStorage
  const userName = utils.getUserName() || 'there';

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className={styles.container}>
      <h1>{getGreeting()}, {userName}!</h1>
      <p>What's on your mind today?</p>
    </div>
  );
}

export default Greeting;
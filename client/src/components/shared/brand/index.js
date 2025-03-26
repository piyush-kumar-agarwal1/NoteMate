import React from 'react'
import styles from './brand.module.scss'
import BrandLightImg from '../../../assets/brand-light.svg'
import BrandDarkImg from '../../../assets/brand-dark.svg'

function BrandLogo(props) {
  const { logoOnly, type = "light", className } = props;
  return (
    <article className={`${styles.brand} ${className}`}>
      <img src={type === "light" ? BrandLightImg : BrandDarkImg} alt="Brand Logo" />
      {!logoOnly ? (
        <h1 className={styles.brandName}>
          <span className={styles.note}>Note</span>
          <span className={styles.mate}>Mate</span>
        </h1>
      ) : null}
    </article>
  )
}

export default BrandLogo
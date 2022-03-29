import styles from './header.module.scss'

export function Header() {
  return(
    <>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <a href="http://localhost:3000/">
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </div>
      </header>
    </>
  )
}

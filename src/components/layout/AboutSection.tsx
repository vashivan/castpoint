import styles from "../../styles/MainPage.module.scss";

export default function AboutSection() {
  return (
    <div className={styles.main}>
      <div className={styles.main_text}>
        <p className={styles.main_text_1}>We’re a team of artists — dancers, performers, and creatives — with years of experience working on international contracts.</p>
        <p className={styles.main_text_2}>We’ve faced the chaos of searching for reliable gigs, navigating visa rules, dealing with dodgy employers, and figuring out life in foreign countries.</p>
        <p className={styles.main_text_3}>So we decided to create Castpoint — a space made by artists, for artists.</p>
      </div>
    </div>
  )
};
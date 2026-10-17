import styles from "./BigWord.module.css";

export default function BigWord() {
  const letters = ["T", "I", "R", "I", "C", "H"];

  return (
    <section className={styles.statementSection} aria-label="Brand statement">
      <div className="container">
        {/* Creative, interactive brand wordmark */}
        <div className={styles.wordmarkContainer}>

          <div className={styles.lettersWrapper}>
            {letters.map((char, index) => (
              <span
                key={index}
                className={styles.char}
                style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}
                data-letter={char}
              >
                {char}
              </span>
            ))}
          </div>
          <span className={styles.dot}>.</span>
        </div>

        <p className={styles.subtext}>
          Handpicked seasonal orchard produce & small-batch artisanal jams from the base of Tirich Mir.
        </p>
      </div>
    </section>
  );
}

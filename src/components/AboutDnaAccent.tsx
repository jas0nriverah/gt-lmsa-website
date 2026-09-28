import styles from "./AboutDnaAccent.module.css";

export function AboutDnaAccent() {
  return (
    <div className={styles.accent} aria-hidden="true">
      <svg viewBox="0 0 140 300" fill="none" focusable="false">
        <g className={styles.rungs} stroke="#b3a369" strokeWidth="1.25" strokeLinecap="round">
          <path d="M48 20H92M37 44H103M36 68H104M48 92H92M69 116H71M48 140H92M36 164H104M37 188H103M48 212H92M69 236H71M48 260H92M36 284H104" />
        </g>
        <path
          className={styles.helixNavy}
          d="M48 20C106 38 106 50 48 68S-10 98 48 116 106 146 48 164-10 194 48 212 106 242 48 260-10 278 36 294"
        />
        <path
          className={styles.helixGold}
          d="M92 20C34 38 34 50 92 68s58 30 0 48-58 30 0 48 58 30 0 48-58 30 0 48 58 18 12 34"
        />
      </svg>
    </div>
  );
}

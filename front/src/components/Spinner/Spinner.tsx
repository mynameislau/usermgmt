import React from "react";
import styles from "./Spinner.module.scss";

export const Spinner = ({ fontSize }: { fontSize?: string }) => (
  <div style={{ fontSize: fontSize ?? '1em' }}>
    <div className={styles.spinner}>Chargement...</div>
  </div>
);

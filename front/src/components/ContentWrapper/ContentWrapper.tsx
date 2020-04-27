import React, { FunctionComponent } from "react";
import styles from "./ContentWrapper.module.scss";

export const ContentWrapper: FunctionComponent = ({ children }) => (
  <div className={styles.contentWrapper}>{children}</div>
);

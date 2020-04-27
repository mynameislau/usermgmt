import React from "react";
import styles from "./Dialog.module.scss";

export const Dialog = ({
  dialogState,
  updateDialogState,
}: {
  dialogState: string;
  updateDialogState: (state: string) => void;
}) => {
  return dialogState ? (
    <dialog className={styles.dialog} open={dialogState !== ""}>
      <div className={styles.dialogContent}>
        {dialogState}
        <div className={styles.dialogToolbar}>
          <button className="btn" onClick={() => updateDialogState("")}>
            OK
          </button>
        </div>
      </div>
    </dialog>
  ) : null;
};

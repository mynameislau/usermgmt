import React, { useState, Suspense } from "react";
import styles from "./Main.module.scss";
import { Dialog } from "../Dialog/Dialog";
import { QueriesProvider } from "../QueriesProvider/QueriesProvider";
import { Spinner } from "../Spinner/Spinner";

/**
 * Le composant User List est chargé via Suspense
 */
const UserList = React.lazy(() => import("../UserList/UserList"));

/**
 * Contexte pour l'UI général. En l'occurence ici juste l'affichage de modale
 */
export const UIContext = React.createContext({
  dialogState: "",
  updateDialogState: (state: string) => {},
});

export const Main = () => {
  const [dialogState, updateDialogState] = useState("");
  return (
    /* voir composant queries provider */
    <QueriesProvider>
      <UIContext.Provider
        value={{
          dialogState,
          updateDialogState,
        }}
      >
        <Dialog
          dialogState={dialogState}
          updateDialogState={updateDialogState}
        />
        <div className={styles.grid}>
          <header className={styles.header}>
            <i className="fa fa-ship"></i> UserManagement 9000
            <sup>©</sup>
          </header>
          <main className={styles.main}>
            <Suspense fallback={<Spinner fontSize="50px" />}>
              <UserList />
            </Suspense>
          </main>
        </div>
      </UIContext.Provider>
    </QueriesProvider>
  );
};

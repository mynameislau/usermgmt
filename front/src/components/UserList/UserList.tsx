import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { deleteUsers, User } from "../../model/user.service";
import { ContentWrapper } from "../ContentWrapper/ContentWrapper";
import {
  QueriesContext,
  useMutation,
  useQuery,
} from "../QueriesProvider/QueriesProvider";
import { Spinner } from "../Spinner/Spinner";
import styles from "./UserList.module.scss";
import { UIContext } from "../Main/Main";
import { UserEntry } from "../UserEntry/UserEntry";

export default () => {
  type FormState = {
    [index: string]: { checked: boolean; id: string };
  };
  const [users, usersError, isPending] = useQuery<User[]>("users");
  const { invalidateQueries } = useContext(QueriesContext);
  // gestion des checked / not checked
  const [formState, updateFormState] = useState<FormState>({});
  // state pour savoir quels users sont en instance de suppression
  const [dirtyUsersState, updateDirtyUsersState] = useState<string[]>([]);
  // permet d'afficher une boite de dialogue
  const { updateDialogState } = useContext(UIContext);

  /**
   * si la liste des users a changé
   * on réinitialise certains valeurs
   */
  useEffect(() => {
    updateDirtyUsersState([]);
    updateFormState(
      users?.reduce(
        (acc, val) => ({
          ...acc,
          [val.id]: { checked: false, id: val.id },
        }),
        {}
      ) ?? {}
    );
  }, [users]);

  // quels users sont selectionnés par l'utilisateur
  const selectedIds = useMemo(
    () =>
      Object.values(formState)
        .filter(({ checked }) => checked)
        .map(({ id }) => id),
    [formState]
  );

  // mutation de la liste des users
  const [deleteUsersMutation] = useMutation<{}>({
    mutator: useCallback(() => {
      updateDirtyUsersState(selectedIds);
      return deleteUsers(selectedIds);
    }, [selectedIds]),
    onError: useCallback(
      (_error: string) => {
        updateDialogState("Oops, an error occured ! Try again.");
        invalidateQueries(/^users.*/);
      },
      [invalidateQueries, updateDialogState]
    ),
    onSuccess: useCallback(
      (_data) => {
        updateDialogState("The selected users were successfully deleted");
        invalidateQueries(/^users.*/);
      },
      [invalidateQueries, updateDialogState]
    ),
  });

  // fonction au click sur le bouton supprimer
  const onDelete = useCallback(() => {
    deleteUsersMutation();
  }, [deleteUsersMutation]);

  // au clic sur une checkbox
  const updateCheckbox = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const id = event.target.value;
      updateFormState({
        ...formState,
        [id]: {
          ...formState[id],
          checked: formState[id]?.checked ? false : true,
        },
      });
    },
    [updateFormState, formState]
  );

  // si la liste des users n'a pas été correctemnt fetchée
  if (usersError) {
    return (
      <ContentWrapper>
        <div className="big-spacer">
          An error occured while fetching the user list. Try reloading.
          <br />
          <button className="btn" onClick={() => invalidateQueries(/^users/)}>
            Refresh
          </button>
        </div>
      </ContentWrapper>
    );
  }

  // quand on est en train de charger la liste des users
  // on affiche un spinner
  if (!users && isPending) {
    return <Spinner fontSize="50px" />;
  }

  // si la liste est vide
  if (!users || users.length === 0) {
    return <div>No users for now !</div>;
  }

  // dernier "cas": on affiche la liste des users
  return (
    <div>
      <div className={styles.toolbar}>
        {selectedIds.length > 0 && (
          <button className="btn" onClick={onDelete}>
            <i className="fa fa-trash"></i> Delete
          </button>
        )}
        <button
          className="btn btn--trsp"
          onClick={() => invalidateQueries(/^users/)}
        >
          {isPending ? <Spinner /> : <i className="fa fa-sync"></i>}
        </button>
      </div>
      <ContentWrapper>
        <div className={styles.userList}>
          <ul>
            {users.map((user) => (
              <li
                key={user.id}
                style={{ opacity: dirtyUsersState.includes(user.id) ? 0.5 : 1 }}
              >
                <UserEntry
                  isChecked={formState[user.id]?.checked ?? false}
                  user={user}
                  updateCheckbox={updateCheckbox}
                />
              </li>
            ))}
          </ul>
        </div>
      </ContentWrapper>
    </div>
  );
};

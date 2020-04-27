import React from "react";
import { User } from "../../model/user.service";
import styles from './UserEntry.module.scss';

export const UserEntry = ({
  user,
  isChecked,
  updateCheckbox,
}: {
  user: User;
  isChecked: boolean;
  updateCheckbox: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {

  const [first, last] = user.name.toLowerCase().split(" ");
  const userColor = (first.charCodeAt(0) - 97 + last.charCodeAt(0) - 97) / 50 * 100 + 110 ;

  return (
    <React.Fragment>
      <input
        id={user.id}
        name="users"
        type="checkbox"
        className="custom-checkbox"
        onChange={updateCheckbox}
        value={user.id}
        checked={isChecked}
      />
      <label htmlFor={user.id}></label>
      <div
        className={styles.avatar}
        style={{ backgroundColor: `hsl(${userColor}, 100%, 40%)` }}
      >
        <i className="fa fa-user"></i>
      </div>
      <div className={styles.userName}>
        <strong>{user.name}</strong> • {user.company.name}
      </div>
    </React.Fragment>
  );};

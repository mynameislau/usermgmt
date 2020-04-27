import { apiWrite, Method } from "../utils/api-utils";

export type User = {
  id: string;
  name: string;
  company: {
    name: string
  }
};

export const deleteUsers = (userIds: string[]) => {

  return Promise.all(
    userIds.map((id) => apiWrite(Method.DELETE, `users/${id}`, {}))
  );
};

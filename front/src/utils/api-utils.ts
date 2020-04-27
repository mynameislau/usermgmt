const baseURL = process.env.REACT_APP_API_BASEURL;

export enum Method {
  DELETE = "DELETE",
  POST = "POST",
}

const normalizeResponse = <T>(response: Response) => {
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json().then((data) => data as T);
};

export const apiGet = <T>(route: string) =>
  window.fetch(`${baseURL}/${route}`).then((res) => normalizeResponse<T>(res));

export const apiWrite = <T>(method: Method, route: string, body: any) =>
  window
    .fetch(`${baseURL}/${route}`, {
      method: method,
    })
    .then((res) => normalizeResponse<T>(res));

export const apiDelete = (route: string, body: any) =>
  apiWrite(Method.DELETE, route, body);

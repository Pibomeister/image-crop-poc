/**
 *
 * @param response - the http response object
 * @returns - the same object only if the status is good 😈
 */
export const processStatus = (response: Response) => {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    console.error(
      `${response.url} - [${response.status}] ${response.statusText}`
    );
    return Promise.reject(new Error("Error loading: " + response));
  }
};

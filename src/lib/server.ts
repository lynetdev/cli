export type Result<T> = {
  ok: boolean;
  status: number; // true if status code is in the range 200-299
  payload: T;
};

export const makeResultFromResponse = async <T>(
  response: Response,
  errorPrefix: string,
  payload: T,
): Promise<Result<T>> => {
  if (!response.ok) {
    throw new Error(`${errorPrefix}`);
  }

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
};

export const makeResultFromJsonResponse = async <T>(
  response: Response,
  errorPrefix: string,
): Promise<Result<T>> => {
  let payload;

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error(`${errorPrefix}: ${error?.toString()}`);
  }

  if (payload && typeof payload === "object" && "error" in payload) {
    throw new Error(`${errorPrefix}`);
  }

  return makeResultFromResponse(response, errorPrefix, payload);
};

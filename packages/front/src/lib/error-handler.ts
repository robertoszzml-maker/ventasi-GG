import { NEXT_STORE_GLOBAL } from "@/config";
import { Mutation, Query } from "@tanstack/react-query";
import { refreshToken } from "./auth.service";

let isRedirecting = false;
let isRefreshing = false;
let failedQueue: {
  query?: Query;
  mutation?: Mutation<unknown, unknown, unknown, unknown>;
  variables?: unknown;
}[] = [];

const errorHandler = (
  error: unknown,
  query?: Query,
  mutation?: Mutation<unknown, unknown, unknown, unknown>,
  variables?: unknown
) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error

  const { status, data } = error.response!;
  if (status === 401) {
    if (mutation) refreshTokenAndRetry(undefined, mutation, variables);
    else refreshTokenAndRetry(query);
  } else console.error(data?.message);
};

export const queryErrorHandler = (error: unknown, query: Query): void => {
  errorHandler(error, query);
};

export const mutationErrorHandler = (
  error: unknown,
  variables: unknown,
  context: unknown,
  mutation: Mutation<unknown, unknown, unknown, unknown>
) => {
  errorHandler(error, undefined, mutation, variables);
};

const processFailedQueue = () => {
  failedQueue.forEach(({ query, mutation, variables }) => {
    if (mutation) {
      const { options } = mutation;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      mutation.setOptions({ ...options, variables });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      mutation.execute();
    }
    if (query) query.fetch();
  });
  isRefreshing = false;
  failedQueue = [];
};

const refreshTokenAndRetry = async (
  query?: Query,
  mutation?: Mutation<unknown, unknown, unknown, unknown>,
  variables?: unknown
) => {
  try {
    if (!isRefreshing) {
      isRefreshing = true;
      failedQueue.push({ query, mutation, variables });
      const data = await refreshToken();
      if (data?.success) {
        const globalState = JSON.parse(localStorage.getItem(NEXT_STORE_GLOBAL) ?? "{}")
        globalState.state.token = data.data.token
      }
      processFailedQueue();
    } else failedQueue.push({ query, mutation, variables });
  } catch {
    const globalState = JSON.parse(localStorage.getItem(NEXT_STORE_GLOBAL) ?? "{}")
    globalState.state.token = ''
    if (!isRedirecting) {
      isRedirecting = true;
      window.location.href = "/auth/login";
    }
  }
};

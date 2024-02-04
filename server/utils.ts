// check if a string is part of enum
// from:
// https://stackoverflow.com/questions/58278652/generic-enum-type-guard#:~:text=const%20isSomeEnum%20%3D%20%3CT%20extends%20%7B%20%5Bs%3A%20string%5D%3A%20unknown%20%7D%3E(e%3A%20T)%20%3D%3E%20(token%3A%20unknown)%3A%20token%20is%20T%5Bkeyof%20T%5D%20%3D%3E%20Object.values(e).includes(token%20as%20T%5Bkeyof%20T%5D)%3B
export const isSomeEnum =
  <T extends { [s: string]: unknown }>(e: T) =>
  (token: unknown): token is T[keyof T] =>
    Object.values(e).includes(token as T[keyof T]);

import bcrypt from "bcrypt";

const ROUNDS = 12;

// Write helper functions to hash and verify passwords
export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);
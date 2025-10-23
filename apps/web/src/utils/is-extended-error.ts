import { ExtendError } from '../types/error';

export const isExtendError = (e: unknown): e is ExtendError =>
  typeof e === 'object' && e !== null && 'status' in e;

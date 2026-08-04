import type { ApplicationIR } from '../ir/types.js';
type RawSpec = Record<string, any>;
/**
 * @author arefin
 * @description Normalize raw specification input into a fully-resolved application intermediate representation
 */
export declare function normalizeSpecification(raw: RawSpec): ApplicationIR;
export {};

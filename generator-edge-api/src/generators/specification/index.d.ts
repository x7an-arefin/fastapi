import Generator from 'yeoman-generator';
import type { ApplicationIR } from '../../lib/ir/types.js';
type AnyOpts = Record<string, any>;
export default class SpecificationGenerator extends Generator {
    ir: ApplicationIR;
    /**
     * @author arefin
     * @description Initialize the class instance with required dependencies and configuration
     */
    constructor(args: string | string[], opts: AnyOpts);
    /**
     * @author arefin
     * @description Yeoman initializing phase — display banner, parse options, and load/validate the specification
     */
    initializing(): Promise<void>;
}
export {};

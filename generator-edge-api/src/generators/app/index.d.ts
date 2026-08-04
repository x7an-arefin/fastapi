import Generator from 'yeoman-generator';
type AnyOpts = Record<string, any>;
export default class AppGenerator extends Generator {
    private ir;
    /**
     * @author arefin
     * @description Initialize the class instance with required dependencies and configuration
     */
    constructor(args: string | string[], opts: AnyOpts);
    /**
     * @author arefin
     * @description Yeoman initializing phase — display banner, parse options, and load/validate the specification
     */
    initializing(): void;
    /**
     * @author arefin
     * @description Yeoman configuring phase — validate resource budgets and prepare generation context
     */
    configuring(): void;
    /**
     * @author arefin
     * @description Yeoman writing phase — begin code generation or print dry-run plan
     */
    writing(): void;
    /**
     * @author arefin
     * @description Yeoman default phase — compose and run all sub-generators for project scaffold, entities, endpoints, and OpenAPI
     */
    default(): Promise<void>;
    /**
     * @author arefin
     * @description Yeoman end phase — display completion message with next steps and generated file summary
     */
    end(): void;
    /**
     * @author arefin
     * @description Print a dry-run plan showing which files would be generated without actually writing them
     */
    private _printPlan;
}
export {};

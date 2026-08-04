import Generator from 'yeoman-generator';
type AnyOpts = Record<string, any>;
export default class ProjectGenerator extends Generator {
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
     * @description Write a generated file from a template — always overwrites existing content
     */
    private _writeGenerated;
    /**
     * @author arefin
     * @description Write a managed file from a template — creates if missing, merges if existing
     */
    private _writeManaged;
    /**
     * @author arefin
     * @description Write a scaffolded file from a template — only creates if the file does not already exist
     */
    private _writeScaffolded;
    /**
     * @author arefin
     * @description Write content to a file on disk, creating parent directories as needed
     */
    private _writeFile;
}
export {};

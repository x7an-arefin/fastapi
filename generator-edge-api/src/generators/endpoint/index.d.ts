import Generator from 'yeoman-generator';
type AnyOpts = Record<string, any>;
export default class EndpointGenerator extends Generator {
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
     * @description Yeoman writing phase — begin code generation or print dry-run plan
     */
    writing(): void;
    /**
     * @author arefin
     * @description Generate all lifecycle files (input, output, pre, process, post, test) for a single entity operation
     */
    private _generateEndpoint;
    /**
     * @author arefin
     * @description Write a generated file from a template — always overwrites existing content
     */
    private _writeGenerated;
    /**
     * @author arefin
     * @description Write a scaffolded file from a template — only creates if the file does not already exist
     */
    private _writeScaffolded;
}
export {};

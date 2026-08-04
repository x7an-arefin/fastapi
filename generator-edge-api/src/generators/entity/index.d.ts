import Generator from 'yeoman-generator';
type AnyOpts = Record<string, any>;
export default class EntityGenerator extends Generator {
    private ir;
    private targetEntities;
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
     * @description Write a generated file from a template — always overwrites existing content
     */
    private _writeGenerated;
}
export {};

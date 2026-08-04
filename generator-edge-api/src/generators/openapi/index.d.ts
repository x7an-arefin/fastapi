import Generator from 'yeoman-generator';
type AnyOpts = Record<string, any>;
export default class OpenApiGenerator extends Generator {
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
     * @description Build the complete OpenAPI 3.1 document from the normalized application IR
     */
    private _buildDocument;
    /**
     * @author arefin
     * @description Build the OpenAPI schema definition for a single entity
     */
    private _buildEntitySchema;
    /**
     * @author arefin
     * @description Build the OpenAPI request body schema for the create operation of an entity
     */
    private _buildCreateSchema;
    /**
     * @author arefin
     * @description Build the OpenAPI request body schema for the update operation of an entity (all fields optional)
     */
    private _buildUpdateSchema;
    /**
     * @author arefin
     * @description Convert an entity field definition to its corresponding JSON Schema representation
     */
    private _fieldToJsonSchema;
    /**
     * @author arefin
     * @description Build the OpenAPI path operation object for a single entity CRUD operation
     */
    private _buildOperation;
}
export {};

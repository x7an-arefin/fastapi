import Generator from 'yeoman-generator';
import chalk from 'chalk';
export default class OpenApiGenerator extends Generator {
    ir;
    /**
     * @author arefin
     * @description Initialize the class instance with required dependencies and configuration
     */
    constructor(args, opts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        super(args, opts);
    }
    /**
     * @author arefin
     * @description Yeoman initializing phase — display banner, parse options, and load/validate the specification
     */
    initializing() {
        const opts = this.options;
        this.ir = opts['ir'];
    }
    /**
     * @author arefin
     * @description Yeoman writing phase — begin code generation or print dry-run plan
     */
    writing() {
        this.log(chalk.blue('\n📄 Generating OpenAPI 3.1 document...\n'));
        const doc = this._buildDocument();
        this.fs.write(this.destinationPath('openapi.json'), JSON.stringify(doc, null, 2));
        this.log(chalk.green('  ✅ openapi.json written\n'));
    }
    /**
     * @author arefin
     * @description Build the complete OpenAPI 3.1 document from the normalized application IR
     */
    _buildDocument() {
        const ir = this.ir;
        const paths = {};
        const schemas = {};
        for (const entity of ir.entities) {
            schemas[entity.namePascal] = this._buildEntitySchema(entity);
            schemas[`New${entity.namePascal}`] = this._buildCreateSchema(entity);
            schemas[`Update${entity.namePascal}`] = this._buildUpdateSchema(entity);
            for (const op of entity.operations) {
                const pathKey = op.fullPath.replace(/:(\w+)/g, '{$1}');
                if (!paths[pathKey])
                    paths[pathKey] = {};
                paths[pathKey][op.method.toLowerCase()] = this._buildOperation(entity, op);
            }
        }
        if (ir.storage) {
            paths[`${ir.application.apiPrefix}/media/upload-url`] = {
                post: {
                    operationId: 'generateUploadUrl',
                    summary: 'Generate a presigned B2 upload URL',
                    tags: ['Media'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadUrlRequest' } } },
                    },
                    responses: {
                        '200': { description: 'Presigned URL generated', content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadUrlResponse' } } } },
                    },
                },
            };
            schemas['UploadUrlRequest'] = { type: 'object', required: ['filename', 'mimeType'], properties: { filename: { type: 'string' }, mimeType: { type: 'string' }, entityType: { type: 'string' }, entityId: { type: 'string' } } };
            schemas['UploadUrlResponse'] = { type: 'object', properties: { uploadUrl: { type: 'string' }, objectKey: { type: 'string' }, publicUrl: { type: 'string' }, expiresIn: { type: 'number' } } };
        }
        return {
            openapi: '3.1.0',
            info: {
                title: ir.application.name,
                version: '1.0.0',
                description: `API for ${ir.application.name} — generated from application.json`,
            },
            servers: [{ url: `https://your-worker.workers.dev`, description: 'Production' }],
            paths,
            components: {
                schemas: {
                    ...schemas,
                    ErrorResponse: {
                        type: 'object',
                        required: ['error', 'message', 'correlationId'],
                        properties: {
                            error: { type: 'string' },
                            message: { type: 'string' },
                            correlationId: { type: 'string' },
                        },
                    },
                },
                securitySchemes: {
                    bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
                },
            },
        };
    }
    /**
     * @author arefin
     * @description Build the OpenAPI schema definition for a single entity
     */
    _buildEntitySchema(entity) {
        const properties = {};
        const required = [];
        for (const field of entity.fields) {
            properties[field.nameCamel] = this._fieldToJsonSchema(field);
            if (!field.nullable && field.type !== 'timestamp')
                required.push(field.nameCamel);
        }
        return { type: 'object', required, properties };
    }
    /**
     * @author arefin
     * @description Build the OpenAPI request body schema for the create operation of an entity
     */
    _buildCreateSchema(entity) {
        const properties = {};
        const required = [];
        const createFields = entity.fields.filter((f) => !f.primary && f.generated === false);
        for (const field of createFields) {
            properties[field.nameCamel] = this._fieldToJsonSchema(field);
            if (field.required)
                required.push(field.nameCamel);
        }
        return { type: 'object', required, properties };
    }
    /**
     * @author arefin
     * @description Build the OpenAPI request body schema for the update operation of an entity (all fields optional)
     */
    _buildUpdateSchema(entity) {
        const properties = {};
        const updateFields = entity.fields.filter((f) => !f.primary && f.generated === false);
        for (const field of updateFields) {
            properties[field.nameCamel] = this._fieldToJsonSchema(field);
        }
        return { type: 'object', minProperties: 1, properties };
    }
    /**
     * @author arefin
     * @description Convert an entity field definition to its corresponding JSON Schema representation
     */
    _fieldToJsonSchema(field) {
        switch (field.type) {
            case 'uuid': return { type: 'string', format: 'uuid' };
            case 'string': return { type: 'string', ...(field.minLength && { minLength: field.minLength }), ...(field.maxLength && { maxLength: field.maxLength }) };
            case 'text': return { type: 'string' };
            case 'integer': return { type: 'integer' };
            case 'bigint': return { type: 'integer', format: 'int64' };
            case 'decimal': return { type: 'string', pattern: '^\\d+(\\.\\d+)?$' };
            case 'boolean': return { type: 'boolean' };
            case 'timestamp': return { type: 'string', format: 'date-time' };
            case 'enum': return { type: 'string', enum: field.enumValues ?? [] };
            case 'json': return { type: 'object', additionalProperties: true };
            default: return { type: 'string' };
        }
    }
    /**
     * @author arefin
     * @description Build the OpenAPI path operation object for a single entity CRUD operation
     */
    _buildOperation(entity, op) {
        const tags = [entity.namePascal];
        const security = op.auth ? [{ bearerAuth: [] }] : [];
        const operationId = `${op.operation}${entity.namePascal}`;
        const responses = {
            '4XX': { description: 'Client error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        };
        switch (op.operation) {
            case 'create':
                responses['201'] = { description: `${entity.namePascal} created`, content: { 'application/json': { schema: { $ref: `#/components/schemas/${entity.namePascal}` } } } };
                return { operationId, summary: `Create a ${entity.name}`, tags, security, requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/New${entity.namePascal}` } } } }, responses };
            case 'get':
                responses['200'] = { description: `${entity.namePascal} found`, content: { 'application/json': { schema: { $ref: `#/components/schemas/${entity.namePascal}` } } } };
                return { operationId, summary: `Get a ${entity.name} by ID`, tags, security, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }], responses };
            case 'list':
                responses['200'] = { description: `List of ${entity.namePluralKebab}`, content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { $ref: `#/components/schemas/${entity.namePascal}` } }, nextCursor: { type: 'string', nullable: true }, hasMore: { type: 'boolean' } } } } } };
                return { operationId, summary: `List ${entity.namePluralKebab}`, tags, security, parameters: [{ in: 'query', name: 'cursor', schema: { type: 'string' } }, { in: 'query', name: 'limit', schema: { type: 'integer', default: 20, maximum: 100 } }], responses };
            case 'update':
                responses['200'] = { description: `${entity.namePascal} updated`, content: { 'application/json': { schema: { $ref: `#/components/schemas/${entity.namePascal}` } } } };
                return { operationId, summary: `Update a ${entity.name}`, tags, security, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/Update${entity.namePascal}` } } } }, responses };
            case 'delete':
                responses['204'] = { description: `${entity.namePascal} deleted` };
                return { operationId, summary: `Delete a ${entity.name}`, tags, security, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }], responses };
        }
    }
}
//# sourceMappingURL=index.js.map
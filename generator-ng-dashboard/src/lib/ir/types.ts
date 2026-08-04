export type ControlType = 'input' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
export type DrawerPosition = 'left' | 'right';
export type DrawerMode = 'add' | 'edit' | 'detail' | null;
export type RequestStateStatus = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FieldValidator {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'email' | 'pattern';
  value?: number | string;
  message?: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  control: ControlType;
  inputType?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: SelectOption[];
  validators?: FieldValidator[];
}

export interface ColumnConfig {
  field: string;
  label: string;
  sortable?: boolean;
  badge?: boolean;
  badgeColorMap?: Record<string, string>;
  pipe?: string;
  pipeArgs?: string;
}

export interface ListConfig {
  title: string;
  columns: ColumnConfig[];
  searchable?: boolean;
  searchField?: string;
  actions: {
    rowActions: string[];
    headerActions: string[];
  };
  pagination?: {
    type: 'cursor' | 'offset';
    defaultLimit: number;
  };
}

export interface FormConfig {
  addTitle: string;
  editTitle: string;
  openIn: 'drawer' | 'modal' | 'page';
  drawerPosition: DrawerPosition;
  drawerWidth: string;
  fields: FormFieldConfig[];
}

export interface DetailConfig {
  title: string;
  openIn: 'drawer' | 'modal' | 'page';
  drawerPosition: DrawerPosition;
  drawerWidth: string;
  fields: string[];
}

export interface DeleteConfig {
  confirmDialog: boolean;
  confirmMessage: string;
}

export interface PermissionConfig {
  list?: string;
  create?: string;
  update?: string;
  delete?: string;
}

export interface ApiOperation {
  operationId: string;
  method: string;
  path: string;
  tag: string;
  summary: string;
  hasAuth: boolean;
  requestBodySchemaRef?: string;
  responseSchemaRef?: string;
  pathParams: ParamIR[];
  queryParams: ParamIR[];
  successStatus: number;
  requestBodySchema?: SchemaIR;
  responseSchema?: SchemaIR;
}

export interface ParamIR {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface SchemaIR {
  type: string;
  properties?: Record<string, PropertyIR>;
  required?: string[];
  items?: SchemaIR;
  $ref?: string;
  enum?: string[];
  description?: string;
}

export interface PropertyIR {
  type: string;
  format?: string;
  nullable?: boolean;
  enum?: string[];
  description?: string;
  $ref?: string;
}

export interface ModuleApiOperations {
  list?: ApiOperation;
  create?: ApiOperation;
  get?: ApiOperation;
  update?: ApiOperation;
  delete?: ApiOperation;
}

export interface ModuleIR {
  name: string;
  namePascal: string;
  nameCamel: string;
  nameKebab: string;
  nameSnake: string;
  namePlural: string;
  namePluralKebab: string;
  label: string;
  labelSingular: string;
  route: string;
  icon: string;
  permissions: PermissionConfig;
  listConfig: ListConfig;
  formConfig: FormConfig;
  detailConfig: DetailConfig;
  deleteConfig: DeleteConfig;
  apiOperations: ModuleApiOperations;
}

export interface SidebarItem {
  label: string;
  icon: string;
  module: string;
}

export interface SidebarConfig {
  collapsible: boolean;
  defaultOpen: boolean;
  items: SidebarItem[];
}

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'system';
  primaryColor: string;
  accentColor: string;
  radius: string;
  fontFamily: string;
}

export interface AuthConfig {
  provider: string;
  baseUrl: string;
  sessionRefetchOnFocus: boolean;
  sessionRefetchInterval: number;
  loginRedirect: string;
  logoutRedirect: string;
}

export interface FrontendIR {
  appName: string;
  appTitle: string;
  baseHref: string;
  defaultRoute: string;
  apiBaseUrl: string;
  auth: AuthConfig;
  theme: ThemeConfig;
  sidebar: SidebarConfig;
  modules: ModuleIR[];
}

export interface ApiIR {
  operations: Record<string, ApiOperation>;
  schemas: Record<string, SchemaIR>;
  tags: string[];
}

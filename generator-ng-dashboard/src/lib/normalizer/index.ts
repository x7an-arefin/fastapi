import type { FrontendIR, ModuleIR, ApiIR, ApiOperation } from '../ir/types.js';
import { buildNames } from '../naming/index.js';

/**
 * @author arefin
 * @description Converts raw frontend.json + ApiIR → strongly-typed FrontendIR
 */
export function normalizeFrontendSpec(raw: Record<string, unknown>, apiIR: ApiIR): FrontendIR {
  const appRaw     = (raw['app']     as Record<string, unknown>) ?? {};
  const apiRaw     = (raw['api']     as Record<string, unknown>) ?? {};
  const authRaw    = (raw['auth']    as Record<string, unknown>) ?? {};
  const themeRaw   = (raw['theme']   as Record<string, unknown>) ?? {};
  const sidebarRaw = (raw['sidebar'] as Record<string, unknown>) ?? {};
  const modulesRaw = (raw['modules'] as Record<string, unknown>) ?? {};

  const modules: ModuleIR[] = Object.entries(modulesRaw).map(([key, modRaw]) => {
    const mod = modRaw as Record<string, unknown>;
    const names = buildNames(key);

    // Resolve each CRUD operation by operationId string
    const apiRefMap = (mod['api'] as Record<string, unknown>) ?? {};
    const apiOps: Record<string, ApiOperation | undefined> = {};
    for (const opType of ['list', 'create', 'get', 'update', 'delete'] as const) {
      const operationId = apiRefMap[opType] as string | undefined;
      if (operationId && apiIR.operations[operationId]) {
        apiOps[opType] = apiIR.operations[operationId];
      }
    }

    const listRaw   = (mod['list']   as Record<string, unknown>) ?? {};
    const formRaw   = (mod['form']   as Record<string, unknown>) ?? {};
    const detailRaw = (mod['detail'] as Record<string, unknown>) ?? {};
    const deleteRaw = (mod['delete'] as Record<string, unknown>) ?? {};

    return {
      name:           names.name,
      namePascal:     names.namePascal,
      nameCamel:      names.nameCamel,
      nameKebab:      names.nameKebab,
      nameSnake:      names.nameSnake,
      namePlural:     names.namePlural,
      namePluralKebab: names.namePluralKebab,
      label:          (mod['label']         as string) || names.namePascal,
      labelSingular:  (mod['labelSingular'] as string) || names.namePascal,
      route:          (mod['route']         as string) || `/${names.nameKebab}`,
      icon:           (mod['icon']          as string) || 'heroFolder',
      permissions:    (mod['permissions']   as Record<string, string>) ?? {},
      listConfig: {
        title:       (listRaw['title']     as string) || `${names.namePlural}`,
        columns:     (listRaw['columns']   as []) || [],
        searchable:  !!(listRaw['searchable']),
        searchField: (listRaw['searchField'] as string) || 'name',
        actions: {
          rowActions:    ((listRaw['actions'] as Record<string, unknown>)?.['rowActions']    as string[]) || ['view', 'edit', 'delete'],
          headerActions: ((listRaw['actions'] as Record<string, unknown>)?.['headerActions'] as string[]) || ['add'],
        },
        pagination: (listRaw['pagination'] as { type: 'cursor' | 'offset'; defaultLimit: number }) || { type: 'cursor', defaultLimit: 20 },
      },
      formConfig: {
        addTitle:       (formRaw['addTitle']       as string) || `Add ${names.namePascal}`,
        editTitle:      (formRaw['editTitle']      as string) || `Edit ${names.namePascal}`,
        openIn:         (formRaw['openIn']         as 'drawer' | 'modal' | 'page') || 'drawer',
        drawerPosition: (formRaw['drawerPosition'] as 'left' | 'right') || 'right',
        drawerWidth:    (formRaw['drawerWidth']    as string) || '480px',
        fields:         (formRaw['fields'] as [])?.length 
                          ? (formRaw['fields'] as []) 
                          : inferFormFieldsFromSchema(apiOps['create']?.requestBodySchema || apiOps['update']?.requestBodySchema),
      },
      detailConfig: {
        title:          (detailRaw['title']          as string) || `${names.namePascal} Details`,
        openIn:         (detailRaw['openIn']         as 'drawer' | 'modal' | 'page') || 'drawer',
        drawerPosition: (detailRaw['drawerPosition'] as 'left' | 'right') || 'right',
        drawerWidth:    (detailRaw['drawerWidth']    as string) || '480px',
        fields:         (detailRaw['fields']         as string[]) || [],
      },
      deleteConfig: {
        confirmDialog:  (deleteRaw['confirmDialog']  as boolean) !== false,
        confirmMessage: (deleteRaw['confirmMessage'] as string) || `Are you sure you want to delete this ${names.namePascal}? This action cannot be undone.`,
      },
      apiOperations: apiOps,
    };
  });

  const sidebarItems = (sidebarRaw['items'] as []) || [];

  return {
    appName:      (appRaw['name']         as string) || 'ng-dashboard',
    appTitle:     (appRaw['title']        as string) || 'Angular Dashboard',
    baseHref:     (appRaw['baseHref']     as string) || '/',
    defaultRoute: (appRaw['defaultRoute'] as string) || '/dashboard',
    apiBaseUrl:   (apiRaw['baseUrl']      as string) || 'http://localhost:3000',
    auth: {
      provider:               (authRaw['provider']               as string)  || 'better-auth',
      baseUrl:                (authRaw['baseUrl']                as string)  || 'http://localhost:3000',
      sessionRefetchOnFocus:  !!(authRaw['sessionRefetchOnFocus']),
      sessionRefetchInterval: (authRaw['sessionRefetchInterval'] as number)  || 0,
      loginRedirect:          (authRaw['loginRedirect']          as string)  || '/dashboard',
      logoutRedirect:         (authRaw['logoutRedirect']         as string)  || '/login',
    },
    theme: {
      mode:        (themeRaw['mode']        as 'dark' | 'light' | 'system') || 'dark',
      primaryColor: (themeRaw['primaryColor'] as string) || 'hsl(221 83% 53%)',
      accentColor:  (themeRaw['accentColor']  as string) || 'hsl(262 80% 60%)',
      radius:       (themeRaw['radius']       as string) || '0.5rem',
      fontFamily:   (themeRaw['fontFamily']   as string) || 'Inter',
    },
    sidebar: {
      collapsible: !!(sidebarRaw['collapsible']),
      defaultOpen: (sidebarRaw['defaultOpen'] as boolean) !== false,
      items:       sidebarItems,
    },
    modules,
  };
}

function inferFormFieldsFromSchema(schema: any): any[] {
  if (!schema || !schema.properties) {
    return [
      { name: 'name', label: 'Name', control: 'input', inputType: 'text', required: true },
      { name: 'description', label: 'Description', control: 'textarea', required: false }
    ];
  }
  const fields: any[] = [];
  const required = schema.required || [];
  for (const [propName, propDef] of Object.entries<any>(schema.properties)) {
    if (propName === 'id' || propName === 'createdAt' || propName === 'updatedAt') continue;
    fields.push({
      name: propName,
      label: propName.charAt(0).toUpperCase() + propName.slice(1).replace(/([A-Z])/g, ' $1'),
      control: (propDef.type === 'string' && propName.toLowerCase().includes('desc')) ? 'textarea' : 'input',
      inputType: propName.toLowerCase().includes('email') ? 'email' : (propDef.type === 'integer' || propDef.type === 'number') ? 'number' : 'text',
      required: required.includes(propName),
    });
  }
  return fields.length ? fields : [
    { name: 'name', label: 'Name', control: 'input', inputType: 'text', required: true }
  ];
}

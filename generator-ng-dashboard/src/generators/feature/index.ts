import Generator from 'yeoman-generator';
import path from 'path';
import type { FrontendIR } from '../../lib/ir/types.js';

/** @author arefin */
export default class FeatureGenerator extends Generator {
  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args as any, options as any);
  }

  writing(): void {
    const opts = this.options as unknown as Record<string, unknown>;
    const ir = opts['ir'] as FrontendIR;
    const templatesRoot = opts['templatesRoot'] as string;
    const featureTemplatesRoot = path.join(templatesRoot, 'feature');

    if (!ir || !ir.modules) {
      this.log('No modules found in IR');
      return;
    }

    for (const mod of ir.modules) {
      const ejsContext = {
        nameKebab:       mod.nameKebab,
        namePascal:      mod.namePascal,
        nameCamel:       mod.nameCamel,
        nameSnake:       mod.nameSnake,
        namePlural:      mod.namePlural,
        namePluralKebab: mod.namePluralKebab,
        label:           mod.label,
        labelSingular:   mod.labelSingular,
        route:           mod.route,
        listConfig:      mod.listConfig,
        formConfig:      mod.formConfig,
        detailConfig:    mod.detailConfig,
        deleteConfig:    mod.deleteConfig,
        apiOperations:   mod.apiOperations,
        hasCreate:       !!mod.apiOperations.create,
        hasUpdate:       !!mod.apiOperations.update,
        hasDelete:       !!mod.apiOperations.delete,
        hasGet:          !!mod.apiOperations.get,
        hasList:         !!mod.apiOperations.list,
        permissions:     mod.permissions,
      };

      const featureBase = `src/app/features/${mod.nameKebab}`;
      const k = mod.nameKebab;

      const templates: Array<{ src: string; dest: string }> = [
        { src: 'data-access/models/model.ts.ejs',         dest: `${featureBase}/data-access/models/${k}.model.ts` },
        { src: 'data-access/models/api-types.ts.ejs',     dest: `${featureBase}/data-access/models/${k}-api.types.ts` },
        { src: 'data-access/services/api-service.ts.ejs', dest: `${featureBase}/data-access/services/${k}-api.service.ts` },
        { src: 'data-access/mappers/mapper.ts.ejs',       dest: `${featureBase}/data-access/mappers/${k}.mapper.ts` },
        { src: 'data-access/store/store.ts.ejs',          dest: `${featureBase}/data-access/store/${k}.store.ts` },
        { src: 'data-access/facade.ts.ejs',               dest: `${featureBase}/data-access/${k}.facade.ts` },
        { src: 'data-access/index.ts.ejs',                dest: `${featureBase}/data-access/index.ts` },
        { src: 'ui/page.component.ts.ejs',                dest: `${featureBase}/ui/${k}-page.component.ts` },
        { src: 'ui/page.component.html.ejs',              dest: `${featureBase}/ui/${k}-page.component.html` },
        { src: 'ui/table.component.ts.ejs',               dest: `${featureBase}/ui/${k}-table.component.ts` },
        { src: 'ui/table.component.html.ejs',             dest: `${featureBase}/ui/${k}-table.component.html` },
        { src: 'ui/form.component.ts.ejs',                dest: `${featureBase}/ui/${k}-form.component.ts` },
        { src: 'ui/form.component.html.ejs',              dest: `${featureBase}/ui/${k}-form.component.html` },
        { src: 'ui/detail.component.ts.ejs',              dest: `${featureBase}/ui/${k}-detail.component.ts` },
        { src: 'ui/detail.component.html.ejs',            dest: `${featureBase}/ui/${k}-detail.component.html` },
        { src: 'routes.ts.ejs',                           dest: `${featureBase}/${k}.routes.ts` },
      ];

      for (const tpl of templates) {
        this.fs.copyTpl(
          path.join(featureTemplatesRoot, tpl.src),
          this.destinationPath(tpl.dest),
          ejsContext
        );
      }
    }
  }
}

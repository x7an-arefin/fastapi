import Generator from 'yeoman-generator';
import path from 'path';

/** @author arefin */
export default class SharedGenerator extends Generator {
  constructor(args: string | string[], options: Record<string, unknown>) {
    super(args as any, options as any);
  }
  writing(): void {
    const opts = this.options as unknown as Record<string, unknown>;
    const templatesRoot = opts['templatesRoot'] as string;
    this.fs.copy(
      path.join(templatesRoot, 'shared', '**', '*'),
      this.destinationPath('src/app/shared'),
      { globOptions: { dot: true } }
    );
  }
}
import * as Joi from 'joi';
import * as Path from 'path';
import * as Lint from 'tslint';
import * as TS from 'typescript';

const allowedFileNames = [
    'index.ts',
    'interfaces.ts',
    'test.ts',
    'test-hooks.ts',
    'schema.ts',
    'error.ts',
    'migration.ts',
    'interfaces.yml',
    'module.yml',
];

interface IOptions {
    'exclude-dirs': string[];
}

const validateRuleSchema = Joi.object().keys({
    'exclude-dirs': Joi.array().items(Joi.string()),
});

enum ErrorMessage {
    NOT_ALLOWED_FILE_NAME = 'This file name is not allowed!',
}

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk, this.ruleArguments[0]);
    }
}

const walk = (ctx: Lint.WalkContext<IOptions>) => {
    const fileNamePath = Path.resolve(ctx.sourceFile.fileName);

    if (ctx.options && ctx.options['exclude-dirs']) {
        Joi.assert(ctx.options, validateRuleSchema);
        for (const excludeDir of ctx.options['exclude-dirs']) {
            const dirName = Path.resolve(excludeDir);
            if (isFileInDir(fileNamePath, dirName)) {
                return;
            }
        }
    }

    const filename = Path.basename(fileNamePath);
    if (allowedFileNames.indexOf(filename) === -1) {
        ctx.addFailure(ctx.sourceFile.getStart(ctx.sourceFile) + 1, ctx.sourceFile.end - 1, ErrorMessage.NOT_ALLOWED_FILE_NAME);
    }
};

const isFileInDir = (fileName: string, dirName: string) => {
    return fileName.substring(0, dirName.length) === dirName;
};

import * as Joi from 'joi';
import * as Path from 'path';
import * as Lint from 'tslint';
import { findImports, ImportKind } from 'tsutils';
import * as TS from 'typescript';

interface IOptions {
    dir: string;
    imports: string[];
    'not-outside-import': boolean;
}

const validateRuleSchema = Joi.object()
    .keys({
        dir: Joi.string().required(),
        imports: Joi.array()
            .items(Joi.string())
            .min(1),
        'not-outside-import': Joi.boolean(),
        'exclude-files': Joi.array().items(Joi.string()),
    })
    .or('imports', 'not-outside-import');

enum ErrorMessage {
    PREVENTED_IMPORT = 'This import is prevented!',
    OUT_IMPORT = 'This import is prevented because it is out of the set directory!',
}

export class Rule extends Lint.Rules.AbstractRule {
    public apply(sourceFile: TS.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk, this.ruleArguments);
    }
}

const walk = (ctx: Lint.WalkContext<IOptions[]>) => {
    for (const rule of ctx.options) {
        Joi.assert(rule, validateRuleSchema);

        const file = ctx.sourceFile.fileName;
        const filePath = Path.resolve(file);
        const dirPath = Path.resolve(rule.dir);
        if (!isFileInDir(filePath, dirPath)) {
            continue;
        }
        if (isFileExcluded(rule, filePath)) {
            continue;
        }

        for (const importName of findImports(ctx.sourceFile, ImportKind.All)) {
            if (rule['not-outside-import'] === true) {
                if (isImportOutOfDir(file, importName, dirPath)) {
                    ctx.addFailure(importName.getStart(ctx.sourceFile) + 1, importName.end - 1, ErrorMessage.OUT_IMPORT);
                }
                continue;
            }

            for (const preventImportName of rule.imports) {
                if (isImportPrevented(preventImportName, importName.text)) {
                    ctx.addFailure(importName.getStart(ctx.sourceFile) + 1, importName.end - 1, ErrorMessage.PREVENTED_IMPORT);
                }
            }
        }
    }
};

const isFileInDir = (filePath: string, dirPath: string) => {
    return filePath.substring(0, dirPath.length) === dirPath;
};

const isFileExcluded = (rule: IOptions, filePath: string) => {
    if (rule['exclude-files']) {
        for (const excludeFile of rule['exclude-files']) {
            const fileName = Path.resolve(filePath).replace(/\\/g, '/');
            if (isImportPrevented(excludeFile, fileName)) {
                return true;
            }
        }
    }
    return false;
};

const isImportOutOfDir = (filePath: string, importData: TS.LiteralExpression, dirPath: string) => {
    const importName = importData.text;
    const currentDir = filePath.substring(0, filePath.lastIndexOf('/') + 1);
    const targetFilePath = Path.join(currentDir, importName);
    return !isFileInDir(targetFilePath, dirPath);
};

const isImportPrevented = (preventImportName: string, importName: string) => {
    return new RegExp(`^${preventImportName}$`).test(importName);
};

# prevent-imports
The TSlint rule for set prevented imports.
It is necessary to set a directory (**dir**), which will be checked.

Next is necessary to set an array of **imports**, which is not allowed to use in code or set argument **"not-outside-import"** to **true** for forbidden usage of imports outside of the directory.

Prevented imports can be written with a regular expression.

It is also possible to exclude files with optional argument **exclude-files**.

### Schema of rule
```sh
Joi.object()
.keys({
    dir: Joi.string().required(),
    imports: Joi.array()
        .items(Joi.string())
        .min(1),
    'not-outside-import': Joi.boolean(),
    'exclude-files': Joi.array().items(Joi.string()),
})
.or('imports', 'not-outside-import');
```

### Example of usage at tslint.json
```sh
"prevent-imports": [
  true,
  {
    "dir": "./src/services",
    "imports": [".*di/services"],
    "exclude-files": [".*test.ts", ".*test-hooks.ts"]
  },
  {
    "dir": "./src/utils",
    "not-outside-import": true
  }
]
```

# valid-code-structure
The TSlint rule for valid naming of files.

allowed filenames are:
 - 'index.ts'
 - 'interfaces.ts'
 - 'test.ts'
 - 'test-hooks.ts'
 - 'schema.ts'
 - 'error.ts'
 - 'migration.ts'
 - 'interfaces.yml'
 - 'module.yml'

It is possible to exclude some directories with argument **exclude-dirs**.

### Schema of rule
```sh
Joi.object().keys({
  'exclude-dirs': Joi.array().items(Joi.string()),
}
```

### Example of usage at tslint.json
```sh
"valid-code-structure": [
  true,
  {
    "exclude-dirs": ["./scripts"]
  }
],
```
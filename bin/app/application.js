"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var path = require("path");
var utility_1 = require("./utility");
var Application = /** @class */ (function () {
    function Application(options) {
        /**
         * Files processed during initial scanning
         * @type {string[]}
         */
        this._sourceFiles = [];
        this._unusedEntities = [];
        var tsConfigPath = path.basename(path.dirname('tsconfig.json'), 'tsconfig.json');
        var tsConfig = path.join(tsConfigPath, 'tsconfig.json');
        this.project = new ts_morph_1.Project({
            tsConfigFilePath: tsConfig
        });
        this.scanPath = options.sourceFilePath ? options.sourceFilePath : null;
    }
    Object.defineProperty(Application.prototype, "sourceFiles", {
        get: function () {
            if (this._sourceFiles && !this._sourceFiles.length && this.project) {
                this._sourceFiles = this.project.getSourceFiles() || [];
            }
            return this._sourceFiles;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Application.prototype, "sourceFileNames", {
        get: function () {
            var sourceFileNames = [];
            if (this.sourceFiles && this.sourceFiles.length) {
                this.sourceFiles.forEach(function (sourceFile) {
                    sourceFileNames.push(sourceFile.getBaseName());
                });
            }
            return sourceFileNames;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Application.prototype, "unusedEntities", {
        get: function () {
            return this._unusedEntities || [];
        },
        enumerable: true,
        configurable: true
    });
    Application.prototype.generate = function () {
        var _this = this;
        console.log('Application.generate');
        this.sourceFiles.forEach(function (sourceFile) {
            console.log('Working on sourcefile', sourceFile.getFilePath());
            var sourceFileEntity = _this.parseFile(sourceFile);
            if (utility_1.sourceFileHasUnusedEntities(sourceFileEntity)) {
                _this._unusedEntities.push(sourceFileEntity);
            }
        });
        console.log('unused entities=', this.unusedEntities);
    };
    Application.prototype.unhandledRejectionListener = function (err, p) {
        console.log('Unhandled Rejection at:', p, 'reason:', err);
        process.exit(1);
    };
    Application.prototype.uncaughtExceptionListener = function (err) {
        console.log('Uncaught Exception', err);
    };
    Application.prototype.parseFile = function (sourceFile) {
        var sourceFileEntity = {
            fileName: sourceFile.getBaseName(),
            filePath: sourceFile.getFilePath(),
            unusedFunctions: [],
            unusedClasses: [],
            unusedProperties: [],
            unusedInterfaces: [],
            unusedTypes: [],
            unusedEnums: []
        };
        var classes = this.parseClasses(sourceFile.getClasses());
        sourceFileEntity.unusedFunctions = classes.functions;
        sourceFileEntity.unusedClasses = classes.classes;
        sourceFileEntity.unusedProperties = classes.properties;
        var functions = this.parseMethodsOrFunctions(sourceFile.getFunctions());
        sourceFileEntity.unusedFunctions = __spreadArrays(sourceFileEntity.unusedFunctions, functions);
        var ifaceItems = this.parseInterfaces(sourceFile.getInterfaces());
        sourceFileEntity.unusedInterfaces = __spreadArrays(sourceFileEntity.unusedInterfaces, ifaceItems);
        var enumItems = this.parseEnums(sourceFile.getEnums());
        sourceFileEntity.unusedEnums = __spreadArrays(sourceFileEntity.unusedEnums, enumItems);
        return sourceFileEntity;
    };
    Application.prototype.parseClasses = function (classes) {
        var _this = this;
        var returnObj = {
            properties: [],
            functions: [],
            classes: []
        };
        classes.forEach(function (clazz) {
            console.log('parseClasses, working on class', clazz.getName());
            var references = clazz.findReferencesAsNodes();
            if (!references || !references.length) {
                var unusedClass = {
                    name: clazz.getName(),
                    type: 'class',
                    extends: clazz.getParent().getKindName()
                };
                returnObj.classes.push(unusedClass);
            }
            returnObj.properties = _this.parseProperties(clazz.getProperties());
            returnObj.functions = _this.parseMethodsOrFunctions(clazz.getMethods());
        });
        return returnObj;
    };
    Application.prototype.parseProperties = function (properties) {
        if (properties && properties.length) {
            var props_1 = [];
            properties.forEach(function (property) {
                var references = property.findReferencesAsNodes();
                if (!references || !references.length) {
                    var unusedProp = {
                        name: property.getName(),
                        type: property.getType().getText()
                    };
                    props_1.push(unusedProp);
                }
            });
            return props_1;
        }
        return [];
    };
    Application.prototype.parseMethodsOrFunctions = function (methods) {
        if (methods && methods.length) {
            var unusedMethods_1 = [];
            methods.forEach(function (method) {
                var references = method.findReferencesAsNodes();
                if (!references || !references.length) {
                    var args_1 = [];
                    method.getParameters().forEach(function (param) {
                        var arg = {
                            name: param.getName(),
                            type: param.getType().getText()
                        };
                        args_1.push(arg);
                    });
                    var unusedMethod = {
                        name: method.getName(),
                        arguments: args_1,
                        type: method.getReturnType().getText()
                    };
                    unusedMethods_1.push(unusedMethod);
                }
            });
            return unusedMethods_1;
        }
        return [];
    };
    Application.prototype.parseInterfaces = function (interfaces) {
        var returnObj = [];
        interfaces.forEach(function (iFace) {
            var references = iFace.findReferencesAsNodes();
            if (!references || !references.length) {
                var unusedInterface = {
                    name: iFace.getName(),
                    extends: iFace.getParent().getKindName(),
                    type: 'interface'
                };
                returnObj.push(unusedInterface);
            }
        });
        return returnObj;
    };
    Application.prototype.parseEnums = function (enums) {
        var returnObj = [];
        enums.forEach(function (enumItem) {
            var unusedEnum = {
                name: enumItem.getName(),
                type: null
            };
            returnObj.push(unusedEnum);
        });
        return returnObj;
    };
    Application.prototype.foo = function () {
        console.log('foo');
    };
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=application.js.map
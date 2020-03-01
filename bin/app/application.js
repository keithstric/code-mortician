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
        /**
         * The dead code we found in your project
         * @type {UnusedSourceFileEntity[]}
         */
        this._unusedEntities = [];
        var tsConfigPath = path.basename(path.dirname('tsconfig.json'), 'tsconfig.json');
        var tsConfig = path.join(tsConfigPath, 'tsconfig.json');
        this.project = new ts_morph_1.Project({
            tsConfigFilePath: tsConfig
        });
        this.scanPath = options.sourceFilePath ? options.sourceFilePath : null;
    }
    Object.defineProperty(Application.prototype, "sourceFiles", {
        /**
         *  Array of source files
         *  @type {string[]}
         */
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
        /**
         * Array of file names
         * @type {string[]}
         */
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
        /**
         * The dead code we found in your code
         * @type {UnusedSourceFileEntity[]}
         */
        get: function () {
            return this._unusedEntities || [];
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Scans your project code and builds the unusedEntities
     */
    Application.prototype.generate = function () {
        var _this = this;
        this.sourceFiles.forEach(function (sourceFile) {
            console.log('Working on sourcefile', sourceFile.getFilePath());
            var sourceFileEntity = _this.parseFile(sourceFile);
            if (utility_1.sourceFileHasUnusedEntities(sourceFileEntity)) {
                _this._unusedEntities.push(sourceFileEntity);
            }
        });
        console.log('unused entities=', this.unusedEntities);
    };
    /**
     * Parses each sourcfile provided
     * @param {SourceFile} sourceFile
     * @return {UnusedSourceFileEntity}
     */
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
    /**
     * Parses the provided class' properties and methods
     * @param {ClassDeclaration[]} classes
     * @return {UnusedExtendable[]}
     */
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
                    extends: clazz.getParent().getKindName(),
                    lineNumber: clazz.getStartLineNumber()
                };
                returnObj.classes.push(unusedClass);
            }
            returnObj.properties = _this.parseProperties(clazz.getProperties());
            returnObj.functions = _this.parseMethodsOrFunctions(clazz.getMethods());
        });
        return returnObj;
    };
    /**
     * Parses the provided properties
     * @param {PropertyDeclaration[]} properties
     * @return {UnusedProperty[]}
     */
    Application.prototype.parseProperties = function (properties) {
        if (properties && properties.length) {
            var props_1 = [];
            properties.forEach(function (property) {
                var references = property.findReferencesAsNodes();
                if (!references || !references.length) {
                    var unusedProp = {
                        name: property.getName(),
                        type: property.getType().getText(),
                        lineNumber: property.getStartLineNumber()
                    };
                    props_1.push(unusedProp);
                }
            });
            return props_1;
        }
        return [];
    };
    /**
     * Parses the provided methods or functions
     * @param {FunctionDeclaration[] | MethodDeclaration[]}methods
     * @return {UnusedMethodOrFunction[]}
     */
    Application.prototype.parseMethodsOrFunctions = function (methods) {
        if (methods && methods.length) {
            var unusedMethods_1 = [];
            methods.forEach(function (method) {
                var references = method.findReferencesAsNodes();
                if (!references || !references.length) {
                    var unusedArgs_1 = [];
                    method.getParameters().forEach(function (param) {
                        var argRefs = param.findReferencesAsNodes();
                        if (!argRefs || !argRefs.length) {
                            var arg = {
                                name: param.getName(),
                                type: param.getType().getText()
                            };
                            unusedArgs_1.push(arg);
                        }
                    });
                    var unusedMethod = {
                        name: method.getName(),
                        unusedArguments: unusedArgs_1,
                        type: method.getReturnType().getText(),
                        lineNumber: method.getStartLineNumber()
                    };
                    unusedMethods_1.push(unusedMethod);
                }
            });
            return unusedMethods_1;
        }
        return [];
    };
    /**
     * Parses the provided interfaces
     * @param {InterfaceDeclaration[]} interfaces
     * @return {UnusedExtendable[]}
     */
    Application.prototype.parseInterfaces = function (interfaces) {
        var returnObj = [];
        interfaces.forEach(function (iFace) {
            var references = iFace.findReferencesAsNodes();
            if (!references || !references.length) {
                var unusedInterface = {
                    name: iFace.getName(),
                    extends: iFace.getParent().getKindName(),
                    type: 'interface',
                    lineNumber: iFace.getStartLineNumber()
                };
                returnObj.push(unusedInterface);
            }
        });
        return returnObj;
    };
    /**
     * Parses the provided enums
     * @param {EnumDeclaration[]} enums
     * @return {UnusedEntity[]}
     */
    Application.prototype.parseEnums = function (enums) {
        var returnObj = [];
        enums.forEach(function (enumItem) {
            var unusedEnum = {
                name: enumItem.getName(),
                type: null,
                lineNumber: enumItem.getStartLineNumber()
            };
            returnObj.push(unusedEnum);
        });
        return returnObj;
    };
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=application.js.map
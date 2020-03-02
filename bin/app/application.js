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
var types_1 = require("../types");
var builder_1 = require("./SiteGenerator/builder");
/**
 * Class for the entire scanned application. Holds all the information
 * needed to generate the accompanying html site
 * @class {Application}
 */
var Application = /** @class */ (function () {
    function Application(options) {
        /**
         * Files processed during initial scanning
         * @type {string[]}
         */
        this._sourceFiles = [];
        /**
         * The dead code we found in your project
         * @type {DeadSourceFileEntity[]}
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
         * @type {DeadSourceFileEntity[]}
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
        builder_1.buildSite(this.unusedEntities, { outputPath: path.join(this.scanPath, 'graveyard-docs'), copyFolders: ['css'] });
        console.log("Done. Processed " + this.sourceFiles.length + " source files. Results can be found in the graveyard-docs directory.");
    };
    /**
     * Parses each sourcefile provided
     * @param {SourceFile} sourceFile
     * @return {DeadSourceFileEntity}
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
            unusedEnums: [],
            unusedArguments: []
        };
        var classes = this.parseClasses(sourceFile.getClasses(), sourceFile.getFilePath());
        sourceFileEntity.unusedFunctions = __spreadArrays(sourceFileEntity.unusedFunctions, classes.functions);
        sourceFileEntity.unusedClasses = __spreadArrays(sourceFileEntity.unusedClasses, classes.classes);
        sourceFileEntity.unusedProperties = __spreadArrays(sourceFileEntity.unusedProperties, classes.properties);
        sourceFileEntity.unusedArguments = __spreadArrays(sourceFileEntity.unusedArguments, classes.arguments);
        // Functions
        var functions = this.parseMethodsOrFunctions(sourceFile.getFunctions(), sourceFile.getFilePath());
        sourceFileEntity.unusedFunctions = __spreadArrays(sourceFileEntity.unusedFunctions, functions.methods);
        sourceFileEntity.unusedArguments = __spreadArrays(sourceFileEntity.unusedArguments, functions.arguments);
        // Interfaces
        var ifaceItems = this.parseInterfaces(sourceFile.getInterfaces(), sourceFile.getFilePath());
        sourceFileEntity.unusedInterfaces = __spreadArrays(sourceFileEntity.unusedInterfaces, ifaceItems);
        // Enums
        var enumItems = this.parseEnums(sourceFile.getEnums(), sourceFile.getFilePath());
        sourceFileEntity.unusedEnums = __spreadArrays(sourceFileEntity.unusedEnums, enumItems);
        return sourceFileEntity;
    };
    /**
     * Parses the provided class' properties and methods
     * @param {ClassDeclaration[]} classes
     * @param {string} sourceFileName
     * @return {DeadExtendable[]}
     */
    Application.prototype.parseClasses = function (classes, sourceFileName) {
        var _this = this;
        var returnObj = {
            properties: [],
            functions: [],
            arguments: [],
            classes: []
        };
        classes.forEach(function (clazz) {
            returnObj.properties = _this.parseProperties(clazz.getProperties(), sourceFileName);
            var methodItems = _this.parseMethodsOrFunctions(clazz.getMethods(), sourceFileName);
            returnObj.functions = methodItems.methods;
            returnObj.arguments = methodItems.arguments;
            var referenceNodes = clazz.findReferencesAsNodes();
            if (!referenceNodes || !referenceNodes.length) {
                var unusedClass = {
                    name: clazz.getName(),
                    type: 'class',
                    extends: clazz.getParent().getKindName(),
                    lineNumber: clazz.getStartLineNumber(),
                    entityType: types_1.DeadEntityType.CLASS,
                    sourceFile: sourceFileName
                };
                returnObj.classes.push(unusedClass);
            }
        });
        return returnObj;
    };
    /**
     * Parses the provided properties
     * @param {PropertyDeclaration[]} properties
     * @param {string} sourceFileName
     * @return {DeadProperty[]}
     */
    Application.prototype.parseProperties = function (properties, sourceFileName) {
        if (properties && properties.length) {
            var props_1 = [];
            properties.forEach(function (property) {
                var referenceNodes = property.findReferencesAsNodes();
                if (!referenceNodes || !referenceNodes.length) {
                    var unusedProp = {
                        name: property.getName(),
                        type: property.getType().getText(),
                        lineNumber: property.getStartLineNumber(),
                        parentName: '',
                        entityType: types_1.DeadEntityType.PROPERTY,
                        sourceFile: sourceFileName
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
     * @param {string} sourceFileName
     * @return {DeadMethodOrFunction[]}
     */
    Application.prototype.parseMethodsOrFunctions = function (methods, sourceFileName) {
        var returnObj = {
            methods: [],
            arguments: []
        };
        if (methods && methods.length) {
            methods.forEach(function (method) {
                method.getParameters().forEach(function (param) {
                    var argRefs = param.findReferencesAsNodes();
                    if (!argRefs || !argRefs.length) {
                        var arg = {
                            name: param.getName(),
                            type: param.getType().getText(),
                            functionName: method.getName(),
                            lineNumber: param.getStartLineNumber(),
                            entityType: types_1.DeadEntityType.ARGUMENT,
                            sourceFile: sourceFileName,
                            parentName: method.getName()
                        };
                        returnObj.arguments.push(arg);
                    }
                });
                var references = method.findReferencesAsNodes();
                if (!references || !references.length) {
                    var unusedMethod = {
                        name: method.getName(),
                        type: method.getReturnType().getText(),
                        lineNumber: method.getStartLineNumber(),
                        parentName: '',
                        entityType: types_1.DeadEntityType.METHODORFUNCTION,
                        sourceFile: sourceFileName
                    };
                    returnObj.methods.push(unusedMethod);
                }
            });
        }
        return returnObj;
    };
    /**
     * Parses the provided interfaces
     * @param {InterfaceDeclaration[]} interfaces
     * @param {string} sourceFileName
     * @return {DeadExtendable[]}
     */
    Application.prototype.parseInterfaces = function (interfaces, sourceFileName) {
        var returnObj = [];
        interfaces.forEach(function (iFace) {
            var references = iFace.findReferencesAsNodes();
            if (!references || !references.length) {
                var unusedInterface = {
                    name: iFace.getName(),
                    extends: iFace.getParent().getKindName(),
                    type: 'interface',
                    lineNumber: iFace.getStartLineNumber(),
                    entityType: types_1.DeadEntityType.INTERFACE,
                    sourceFile: sourceFileName
                };
                returnObj.push(unusedInterface);
            }
        });
        return returnObj;
    };
    /**
     * Parses the provided enums
     * @param {EnumDeclaration[]} enums
     * @param {string} sourceFileName
     * @return {DeadEntity[]}
     */
    Application.prototype.parseEnums = function (enums, sourceFileName) {
        var returnObj = [];
        enums.forEach(function (enumItem) {
            var unusedEnum = {
                name: enumItem.getName(),
                type: null,
                lineNumber: enumItem.getStartLineNumber(),
                entityType: types_1.DeadEntityType.ENUM,
                sourceFile: sourceFileName
            };
            returnObj.push(unusedEnum);
        });
        return returnObj;
    };
    return Application;
}());
exports.Application = Application;
//# sourceMappingURL=application.js.map
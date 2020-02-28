"use strict";
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
        console.log('tsConfigPath=', tsConfigPath);
        var tsConfig = path.join(tsConfigPath, 'tsconfig.json');
        console.log('tsConfig=', tsConfig);
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
            var classes = _this.parseClasses(sourceFile.getClasses());
            console.log('classes=', classes);
            if (utility_1.sourceFileHasUnusedEntities(sourceFileEntity)) {
                _this._unusedEntities.push(sourceFileEntity);
            }
        });
    };
    Application.prototype.unhandledRejectionListener = function (err, p) {
        console.log('Unhandled Rejection at:', p, 'reason:', err);
        process.exit(1);
    };
    Application.prototype.uncaughtExceptionListener = function (err) {
        console.log('Uncaught Exception', err);
    };
    Application.prototype.parseClasses = function (classes) {
        var _this = this;
        var returnObj = {
            properties: [],
            functions: [],
            classes: []
        };
        classes.forEach(function (clazz) {
            var references = clazz.findReferences();
            if (!references || !references.length) {
                var unusedClass = {
                    name: clazz.getName(),
                    type: 'class',
                    extends: clazz.getParent().getKindName()
                };
                returnObj.classes.push(unusedClass);
            }
            returnObj.properties = _this.parseProperties(clazz.getProperties());
            returnObj.functions = _this.parseMethods(clazz.getMethods());
        });
        return returnObj;
    };
    Application.prototype.parseProperties = function (properties) {
        if (properties && properties.length) {
            var props_1 = [];
            properties.forEach(function (property) {
                var references = property.findReferences();
                if (!references || !references.length) {
                    var unusedProp = {
                        name: property.getName(),
                        type: property.getKindName()
                    };
                    props_1.push(unusedProp);
                }
            });
            return props_1;
        }
        return [];
    };
    Application.prototype.parseMethods = function (methods) {
        console.log('Application.parseFunctions, functions.length=', methods.length);
        if (methods && methods.length) {
            var unusedMethods_1 = [];
            methods.forEach(function (method) {
                var references = method.findReferences();
                console.log("references for " + method.getName() + " = " + references);
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
    Application.prototype.foo = function () {
        console.log('foo');
    };
    return Application;
}());
exports.Application = Application;

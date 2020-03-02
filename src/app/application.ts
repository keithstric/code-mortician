import {
	ClassDeclaration,
	EnumDeclaration,
	FunctionDeclaration,
	InterfaceDeclaration,
	MethodDeclaration,
	ParameterDeclaration,
	Project,
	PropertyDeclaration,
	SourceFile
} from "ts-morph";
import * as path from 'path';
import {sourceFileHasUnusedEntities} from "./utility";
import {
	DeadArgumentEntity,
	DeadEntityType,
	DeadEntity,
	DeadExtendable,
	DeadMethodOrFunction,
	DeadProperty,
	DeadSourceFileEntity
} from "../types";
import {generateHtmlPage} from "./SiteGenerator/site-builder";
import {buildSite} from "./SiteGenerator/builder";

/**
 * Class for the entire scanned application. Holds all the information
 * needed to generate the accompanying html site
 * @class {Application}
 */
export class Application {

	/**
	 * Files processed during initial scanning
	 * @type {string[]}
	 */
	public _sourceFiles: Array<SourceFile> = [];

	/**
	 * The ts-morph project
	 * @type {Project}
	 */
	public project: Project;

	/**
	 * The path to your project
	 * @type {string}
	 */
	public scanPath: string;

	/**
	 * The dead code we found in your project
	 * @type {DeadSourceFileEntity[]}
	 */
	private _unusedEntities: DeadSourceFileEntity[] = [];

	constructor(options?: any) {
		const tsConfigPath = path.basename(path.dirname('tsconfig.json'), 'tsconfig.json');
		const tsConfig = path.join(tsConfigPath, 'tsconfig.json');
		this.project = new Project({
			tsConfigFilePath: tsConfig
		});
		this.scanPath = options.sourceFilePath ? options.sourceFilePath : null;
	}

	/**
	 *  Array of source files
	 *  @type {string[]}
	 */
	get sourceFiles() {
		if (this._sourceFiles && !this._sourceFiles.length && this.project) {
			this._sourceFiles = this.project.getSourceFiles() || [];
		}
		return this._sourceFiles;
	}

	/**
	 * Array of file names
	 * @type {string[]}
	 */
	get sourceFileNames() {
		const sourceFileNames: string[] = [];
		if (this.sourceFiles && this.sourceFiles.length) {
			this.sourceFiles.forEach((sourceFile) => {
				sourceFileNames.push(sourceFile.getBaseName());
			})
		}
		return sourceFileNames;
	}

	/**
	 * The dead code we found in your code
	 * @type {DeadSourceFileEntity[]}
	 */
	get unusedEntities() {
		return this._unusedEntities || [];
	}

	/**
	 * Scans your project code and builds the unusedEntities
	 */
	public generate() {
		this.sourceFiles.forEach((sourceFile) => {
			console.log('Working on sourcefile', sourceFile.getFilePath());
			const sourceFileEntity = this.parseFile(sourceFile);
			if (sourceFileHasUnusedEntities(sourceFileEntity)) {
				this._unusedEntities.push(sourceFileEntity)
			}
		});
		buildSite(this.unusedEntities, {outputPath: path.join(this.scanPath, 'graveyard-docs'), copyFolders: ['css']});
		console.log(`Done. Processed ${this.sourceFiles.length} source files. Results can be found in the graveyard-docs directory.`);
	}

	/**
	 * Parses each sourcefile provided
	 * @param {SourceFile} sourceFile
	 * @return {DeadSourceFileEntity}
	 */
	private parseFile(sourceFile: SourceFile) {
		const sourceFileEntity: DeadSourceFileEntity = {
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

		const classes = this.parseClasses(sourceFile.getClasses(), sourceFile.getFilePath());
		sourceFileEntity.unusedFunctions = [...sourceFileEntity.unusedFunctions, ...classes.functions];
		sourceFileEntity.unusedClasses = [...sourceFileEntity.unusedClasses, ...classes.classes];
		sourceFileEntity.unusedProperties = [...sourceFileEntity.unusedProperties, ...classes.properties];
		sourceFileEntity.unusedArguments = [...sourceFileEntity.unusedArguments, ...classes.arguments];
		// Functions
		const functions = this.parseMethodsOrFunctions(sourceFile.getFunctions(), sourceFile.getFilePath());
		sourceFileEntity.unusedFunctions = [...sourceFileEntity.unusedFunctions, ...functions.methods];
		sourceFileEntity.unusedArguments = [...sourceFileEntity.unusedArguments, ...functions.arguments];
		// Interfaces
		const ifaceItems = this.parseInterfaces(sourceFile.getInterfaces(), sourceFile.getFilePath());
		sourceFileEntity.unusedInterfaces = [...sourceFileEntity.unusedInterfaces, ...ifaceItems];
		// Enums
		const enumItems = this.parseEnums(sourceFile.getEnums(), sourceFile.getFilePath());
		sourceFileEntity.unusedEnums = [...sourceFileEntity.unusedEnums, ...enumItems];

		return sourceFileEntity;
	}

	/**
	 * Parses the provided class' properties and methods
	 * @param {ClassDeclaration[]} classes
	 * @param {string} sourceFileName
	 * @return {DeadExtendable[]}
	 */
	private parseClasses(classes: ClassDeclaration[], sourceFileName: string): { properties: DeadProperty[], functions: DeadMethodOrFunction[], classes: DeadExtendable[], arguments: DeadArgumentEntity[] } {
		const returnObj = {
			properties: [],
			functions: [],
			arguments: [],
			classes: []
		};
		classes.forEach((clazz: ClassDeclaration) => {
			returnObj.properties = this.parseProperties(clazz.getProperties(), sourceFileName);
			const methodItems = this.parseMethodsOrFunctions(clazz.getMethods(), sourceFileName);
			returnObj.functions = methodItems.methods;
			returnObj.arguments = methodItems.arguments;
			const referenceNodes = clazz.findReferencesAsNodes();
			if (!referenceNodes || !referenceNodes.length) {
				const unusedClass: DeadExtendable = {
					name: clazz.getName(),
					type: 'class',
					extends: clazz.getParent().getKindName(),
					lineNumber: clazz.getStartLineNumber(),
					entityType: DeadEntityType.CLASS,
					sourceFile: sourceFileName
				};
				returnObj.classes.push(unusedClass);
			}
		});
		return returnObj;
	}

	/**
	 * Parses the provided properties
	 * @param {PropertyDeclaration[]} properties
	 * @param {string} sourceFileName
	 * @return {DeadProperty[]}
	 */
	private parseProperties(properties: PropertyDeclaration[], sourceFileName: string): DeadProperty[] {
		if (properties && properties.length) {
			const props: DeadProperty[] = [];
			properties.forEach((property: PropertyDeclaration) => {
				const referenceNodes = property.findReferencesAsNodes();
				if (!referenceNodes || !referenceNodes.length) {
					const unusedProp: DeadProperty = {
						name: property.getName(),
						type: property.getType().getText(),
						lineNumber: property.getStartLineNumber(),
						parentName: '',
						entityType: DeadEntityType.PROPERTY,
						sourceFile: sourceFileName
					};
					props.push(unusedProp);
				}
			});
			return props;
		}
		return [];
	}

	/**
	 * Parses the provided methods or functions
	 * @param {FunctionDeclaration[] | MethodDeclaration[]}methods
	 * @param {string} sourceFileName
	 * @return {DeadMethodOrFunction[]}
	 */
	private parseMethodsOrFunctions<T extends FunctionDeclaration | MethodDeclaration>(methods: T[], sourceFileName: string) {
		const returnObj = {
			methods: [],
			arguments: []
		}
		if (methods && methods.length) {
			methods.forEach((method: T) => {
				method.getParameters().forEach((param: ParameterDeclaration) => {
					const argRefs = param.findReferencesAsNodes();
					if (!argRefs || !argRefs.length) {
						const arg: DeadArgumentEntity = {
							name: param.getName(),
							type: param.getType().getText(),
							functionName: method.getName(),
							lineNumber: param.getStartLineNumber(),
							entityType: DeadEntityType.ARGUMENT,
							sourceFile: sourceFileName,
							parentName: method.getName()
						};
						returnObj.arguments.push(arg);
					}
				});
				const references = method.findReferencesAsNodes();
				if (!references || !references.length) {
					const unusedMethod: DeadMethodOrFunction = {
						name: method.getName(),
						type: method.getReturnType().getText(),
						lineNumber: method.getStartLineNumber(),
						parentName: '',
						entityType: DeadEntityType.METHODORFUNCTION,
						sourceFile: sourceFileName
					};
					returnObj.methods.push(unusedMethod);
				}
			});
		}
		return returnObj;
	}

	/**
	 * Parses the provided interfaces
	 * @param {InterfaceDeclaration[]} interfaces
	 * @param {string} sourceFileName
	 * @return {DeadExtendable[]}
	 */
	private parseInterfaces(interfaces: InterfaceDeclaration[], sourceFileName: string) {
		const returnObj = [];
		interfaces.forEach((iFace: InterfaceDeclaration) => {
			const references = iFace.findReferencesAsNodes();
			if (!references || !references.length) {
				const unusedInterface: DeadExtendable = {
					name: iFace.getName(),
					extends: iFace.getParent().getKindName(),
					type: 'interface',
					lineNumber: iFace.getStartLineNumber(),
					entityType: DeadEntityType.INTERFACE,
					sourceFile: sourceFileName
				};
				returnObj.push(unusedInterface);
			}
		});
		return returnObj;
	}

	/**
	 * Parses the provided enums
	 * @param {EnumDeclaration[]} enums
	 * @param {string} sourceFileName
	 * @return {DeadEntity[]}
	 */
	private parseEnums(enums: EnumDeclaration[], sourceFileName: string) {
		const returnObj = [];
		enums.forEach((enumItem: EnumDeclaration) => {
			const unusedEnum: DeadEntity = {
				name: enumItem.getName(),
				type: null,
				lineNumber: enumItem.getStartLineNumber(),
				entityType: DeadEntityType.ENUM,
				sourceFile: sourceFileName
			};
			returnObj.push(unusedEnum);
		});
		return returnObj;
	}
}

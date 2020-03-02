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
	ArgumentEntity,
	EntityType,
	UnusedEntity,
	UnusedExtendable,
	UnusedMethodOrFunction,
	UnusedProperty,
	UnusedSourceFileEntity
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
	 * @type {UnusedSourceFileEntity[]}
	 */
	private _unusedEntities: UnusedSourceFileEntity[] = [];

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
	 * @type {UnusedSourceFileEntity[]}
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
		console.log('unused entities=', this.unusedEntities);
		buildSite(this.unusedEntities);
	}

	/**
	 * Parses each sourcfile provided
	 * @param {SourceFile} sourceFile
	 * @return {UnusedSourceFileEntity}
	 */
	private parseFile(sourceFile: SourceFile) {
		const sourceFileEntity: UnusedSourceFileEntity = {
			fileName: sourceFile.getBaseName(),
			filePath: sourceFile.getFilePath(),
			unusedFunctions: [],
			unusedClasses: [],
			unusedProperties: [],
			unusedInterfaces: [],
			unusedTypes: [],
			unusedEnums: []
		};

		const classes = this.parseClasses(sourceFile.getClasses());
		sourceFileEntity.unusedFunctions = classes.functions;
		sourceFileEntity.unusedClasses = classes.classes;
		sourceFileEntity.unusedProperties = classes.properties;
		const functions = this.parseMethodsOrFunctions(sourceFile.getFunctions());
		sourceFileEntity.unusedFunctions = [...sourceFileEntity.unusedFunctions, ...functions];
		const ifaceItems = this.parseInterfaces(sourceFile.getInterfaces());
		sourceFileEntity.unusedInterfaces = [...sourceFileEntity.unusedInterfaces, ...ifaceItems];
		const enumItems = this.parseEnums(sourceFile.getEnums());
		sourceFileEntity.unusedEnums = [...sourceFileEntity.unusedEnums, ...enumItems];
		return sourceFileEntity;
	}

	/**
	 * Parses the provided class' properties and methods
	 * @param {ClassDeclaration[]} classes
	 * @return {UnusedExtendable[]}
	 */
	private parseClasses(classes: ClassDeclaration[]): { properties: UnusedProperty[], functions: UnusedMethodOrFunction[], classes: UnusedExtendable[] } {
		const returnObj = {
			properties: [],
			functions: [],
			classes: []
		};
		classes.forEach((clazz: ClassDeclaration) => {
			console.log('parseClasses, working on class', clazz.getName());
			const references = clazz.findReferencesAsNodes();
			if (!references || !references.length) {
				const unusedClass: UnusedExtendable = {
					name: clazz.getName(),
					type: 'class',
					extends: clazz.getParent().getKindName(),
					lineNumber: clazz.getStartLineNumber(),
					entityType: EntityType.CLASS
				};
				returnObj.classes.push(unusedClass);
			}
			returnObj.properties = this.parseProperties(clazz.getProperties());
			returnObj.functions = this.parseMethodsOrFunctions(clazz.getMethods())
		});
		return returnObj;
	}

	/**
	 * Parses the provided properties
	 * @param {PropertyDeclaration[]} properties
	 * @return {UnusedProperty[]}
	 */
	private parseProperties(properties: PropertyDeclaration[]): UnusedProperty[] {
		if (properties && properties.length) {
			const props: UnusedProperty[] = [];
			properties.forEach((property: PropertyDeclaration) => {
				const references = property.findReferencesAsNodes();
				if (!references || !references.length) {
					const unusedProp: UnusedProperty = {
						name: property.getName(),
						type: property.getType().getText(),
						lineNumber: property.getStartLineNumber(),
						parentName: '',
						entityType: EntityType.PROPERTY
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
	 * @return {UnusedMethodOrFunction[]}
	 */
	private parseMethodsOrFunctions<T extends FunctionDeclaration | MethodDeclaration>(methods: T[]): UnusedMethodOrFunction[] {
		if (methods && methods.length) {
			const unusedMethods: UnusedMethodOrFunction[] = [];
			methods.forEach((method: T) => {
				const unusedArgs: ArgumentEntity[] = [];
				method.getParameters().forEach((param: ParameterDeclaration) => {
					const argRefs = param.findReferencesAsNodes();
					if (!argRefs || !argRefs.length) {
						const arg: ArgumentEntity = {
							name: param.getName(),
							type: param.getType().getText(),
							functionName: method.getName(),
							lineNumber: param.getStartLineNumber(),
							entityType: EntityType.ARGUMENT
						};
						unusedArgs.push(arg);
					}
				});
				const references = method.findReferencesAsNodes();
				if (!references || !references.length) {
					const unusedMethod: UnusedMethodOrFunction = {
						name: method.getName(),
						type: method.getReturnType().getText(),
						lineNumber: method.getStartLineNumber(),
						parentName: '',
						entityType: EntityType.METHODORFUNCTION
					};
					unusedMethods.push(unusedMethod);
				}
			});
			return unusedMethods;
		}
		return [];
	}

	/**
	 * Parses the provided interfaces
	 * @param {InterfaceDeclaration[]} interfaces
	 * @return {UnusedExtendable[]}
	 */
	private parseInterfaces(interfaces: InterfaceDeclaration[]) {
		const returnObj = [];
		interfaces.forEach((iFace: InterfaceDeclaration) => {
			const references = iFace.findReferencesAsNodes();
			if (!references || !references.length) {
				const unusedInterface: UnusedExtendable = {
					name: iFace.getName(),
					extends: iFace.getParent().getKindName(),
					type: 'interface',
					lineNumber: iFace.getStartLineNumber(),
					entityType: EntityType.INTERFACE
				};
				returnObj.push(unusedInterface);
			}
		});
		return returnObj;
	}

	/**
	 * Parses the provided enums
	 * @param {EnumDeclaration[]} enums
	 * @return {UnusedEntity[]}
	 */
	private parseEnums(enums: EnumDeclaration[]) {
		const returnObj = [];
		enums.forEach((enumItem: EnumDeclaration) => {
			const unusedEnum: UnusedEntity = {
				name: enumItem.getName(),
				type: null,
				lineNumber: enumItem.getStartLineNumber(),
				entityType: EntityType.ENUM
			};
			returnObj.push(unusedEnum);
		});
		return returnObj;
	}
}

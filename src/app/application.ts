import {
	Project,
	SourceFile,
	ClassDeclaration,
	PropertyDeclaration,
	ParameterDeclaration, FunctionDeclaration, MethodDeclaration, InterfaceDeclaration, EnumDeclaration
} from "ts-morph";
import * as path from 'path';
import {sourceFileHasUnusedEntities} from "./utility";
// @ts-ignore
import {UnusedExtendable, UnusedEntity, UnusedSourceFileEntity, UnusedProperty, UnusedMethodOrFunction, ArgumentEntity} from "../types";

export class Application {
	/**
	 * Files processed during initial scanning
	 * @type {string[]}
	 */
	public _sourceFiles: Array<SourceFile> = [];

	public project: Project;

	public scanPath: string;

	private _unusedEntities: UnusedSourceFileEntity[] = [];

	constructor(options?: any) {
		const tsConfigPath = path.basename(path.dirname('tsconfig.json'), 'tsconfig.json');
		const tsConfig = path.join(tsConfigPath, 'tsconfig.json');
		this.project = new Project({
			tsConfigFilePath: tsConfig
		});
		this.scanPath = options.sourceFilePath ? options.sourceFilePath : null;
	}

	get sourceFiles() {
		if (this._sourceFiles && !this._sourceFiles.length && this.project) {
			this._sourceFiles = this.project.getSourceFiles() || [];
		}
		return this._sourceFiles;
	}

	get sourceFileNames() {
		const sourceFileNames: string[] = [];
		if (this.sourceFiles && this.sourceFiles.length) {
			this.sourceFiles.forEach((sourceFile) => {
				sourceFileNames.push(sourceFile.getBaseName());
			})
		}
		return sourceFileNames;
	}

	get unusedEntities() {
		return this._unusedEntities || [];
	}

	public generate() {
		this.sourceFiles.forEach((sourceFile) => {
			console.log('Working on sourcefile', sourceFile.getFilePath());
			const sourceFileEntity = this.parseFile(sourceFile);
			if (sourceFileHasUnusedEntities(sourceFileEntity)) {
				this._unusedEntities.push(sourceFileEntity)
			}
		});
		console.log('unused entities=', this.unusedEntities);
	}

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
					lineNumber: clazz.getStartLineNumber()
				};
				returnObj.classes.push(unusedClass);
			}
			returnObj.properties = this.parseProperties(clazz.getProperties());
			returnObj.functions = this.parseMethodsOrFunctions(clazz.getMethods())
		});
		return returnObj;
	}

	private parseProperties(properties: PropertyDeclaration[]): UnusedProperty[] {
		if (properties && properties.length) {
			const props: UnusedProperty[] = [];
			properties.forEach((property: PropertyDeclaration) => {
				const references = property.findReferencesAsNodes();
				if (!references || !references.length) {
					const unusedProp: UnusedProperty = {
						name: property.getName(),
						type: property.getType().getText(),
						lineNumber: property.getStartLineNumber()
					};
					props.push(unusedProp);
				}
			});
			return props;
		}
		return [];
	}

	private parseMethodsOrFunctions<T extends FunctionDeclaration | MethodDeclaration>(methods: T[]): UnusedMethodOrFunction[] {
		if (methods && methods.length) {
			const unusedMethods: UnusedMethodOrFunction[] = [];
			methods.forEach((method: T) => {
				const references = method.findReferencesAsNodes();
				if (!references || !references.length) {
					const unusedArgs: ArgumentEntity[] = [];
					method.getParameters().forEach((param: ParameterDeclaration) => {
						const argRefs = param.findReferencesAsNodes();
						if (!argRefs || !argRefs.length) {
							const arg: ArgumentEntity = {
								name: param.getName(),
								type: param.getType().getText()
							};
							unusedArgs.push(arg);
						}
					});
					const unusedMethod: UnusedMethodOrFunction = {
						name: method.getName(),
						unusedArguments: unusedArgs,
						type: method.getReturnType().getText(),
						lineNumber: method.getStartLineNumber()
					};
					unusedMethods.push(unusedMethod);
				}
			});
			return unusedMethods;
		}
		return [];
	}

	private parseInterfaces(interfaces: InterfaceDeclaration[]) {
		const returnObj = [];
		interfaces.forEach((iFace: InterfaceDeclaration) => {
			const references = iFace.findReferencesAsNodes();
			if (!references || !references.length) {
				const unusedInterface: UnusedExtendable = {
					name: iFace.getName(),
					extends: iFace.getParent().getKindName(),
					type: 'interface',
					lineNumber: iFace.getStartLineNumber()
				};
				returnObj.push(unusedInterface);
			}
		});
		return returnObj;
	}

	private parseEnums(enums: EnumDeclaration[]) {
		const returnObj = [];
		enums.forEach((enumItem: EnumDeclaration) => {
			const unusedEnum: UnusedEntity = {
				name: enumItem.getName(),
				type: null,
				lineNumber: enumItem.getStartLineNumber()
			};
			returnObj.push(unusedEnum);
		});
		return returnObj;
	}
}

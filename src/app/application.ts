import { Project, SourceFile, ClassDeclaration, PropertyDeclaration, MethodDeclaration, ParameterDeclaration } from "ts-morph";
import * as path from 'path';
import { sourceFileHasUnusedEntities } from "./utility";

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
		console.log('tsConfigPath=', tsConfigPath);
		const tsConfig = path.join(tsConfigPath, 'tsconfig.json');
		console.log('tsConfig=', tsConfig);
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
		if(this.sourceFiles && this.sourceFiles.length) {
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
		console.log('Application.generate');
		this.sourceFiles.forEach((sourceFile) => {
			console.log('Working on sourcefile', sourceFile.getFilePath());
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
			console.log('classes=', classes);
			if (sourceFileHasUnusedEntities(sourceFileEntity)) {
				this._unusedEntities.push(sourceFileEntity)
			}
		});
	}

	private unhandledRejectionListener(err, p) {
		console.log('Unhandled Rejection at:', p, 'reason:', err);
		process.exit(1);
	}

	private uncaughtExceptionListener(err) {
		console.log('Uncaught Exception', err);
	}

	private parseClasses(classes: ClassDeclaration[]): {properties: UnusedProperty[], functions: UnusedFunction[], classes: UnusedExtendable[]} {
		const returnObj = {
			properties: [],
			functions: [],
			classes: []
		};
		classes.forEach((clazz: ClassDeclaration) => {
			const references = clazz.findReferences();
			if (!references || !references.length) {
				const unusedClass: UnusedExtendable = {
					name: clazz.getName(),
					type: 'class',
					extends: clazz.getParent().getKindName()
				};
				returnObj.classes.push(unusedClass);
			}
			returnObj.properties = this.parseProperties(clazz.getProperties());
			returnObj.functions = this.parseMethods(clazz.getMethods())
		});
		return returnObj;
	}

	private parseProperties(properties: PropertyDeclaration[]): UnusedProperty[] {
		if (properties && properties.length) {
			const props: UnusedProperty[] = [];
			properties.forEach((property: PropertyDeclaration) => {
				const references = property.findReferences();
				if (!references || !references.length) {
					const unusedProp: UnusedProperty = {
						name: property.getName(),
						type: property.getKindName()
					};
					props.push(unusedProp);
				}
			});
			return props;
		}
		return [];
	}

	private parseMethods(methods: MethodDeclaration[]): UnusedFunction[] {
		console.log('Application.parseFunctions, functions.length=', methods.length);
		if (methods && methods.length) {
			const unusedMethods: UnusedFunction[] = [];
			methods.forEach((method: MethodDeclaration) => {
				const references = method.findReferences();
				console.log(`references for ${method.getName()} = ${references}`);
				if (!references || !references.length) {
					const args = [];
					method.getParameters().forEach((param: ParameterDeclaration) => {
						const arg: ArgumentEntity = {
							name: param.getName(),
							type: param.getType().getText()
						};
						args.push(arg);
					});
					const unusedMethod: UnusedFunction = {
						name: method.getName(),
						arguments: args,
						type: method.getReturnType().getText()
					};
					unusedMethods.push(unusedMethod);
				}
			});
			return unusedMethods;
		}
		return [];
	}

	public foo() {
		console.log('foo');
	}
}

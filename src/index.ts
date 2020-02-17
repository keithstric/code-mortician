import { Project, ClassDeclaration, PropertyDeclaration, MethodDeclaration, FunctionDeclaration, ParameterDeclaration } from 'ts-morph';
import * as path from 'path';

interface UnusedEntity {
	name: string;
	type: string;
}

interface ArgumentEntity {
	name: string;
	type: string;
}

interface UnusedFunction extends UnusedEntity {
	arguments: ArgumentEntity[];
}

interface UnusedProperty extends UnusedEntity {
	type: string;
}

interface UnusedExtendable extends UnusedEntity {
	extends: string;
}

interface UnusedSourceFileEntity {
	fileName: string;
	filePath: string;
	unusedFunctions: UnusedFunction[];
	unusedProperties: UnusedProperty[];
	unusedInterfaces: UnusedExtendable[];
	unusedClasses: UnusedExtendable[];
	unusedTypes: UnusedExtendable[];
	unusedEnums: UnusedEntity[];
}

const project = new Project({
	tsConfigFilePath: path.basename(path.dirname('tsconfig.json'));
});

const unusedEntities: UnusedSourceFileEntity[] = [];

project.getSourceFiles().forEach((sourceFile) => {
	const sourceFileEntity: UnusedSourceFileEntity = {
		fileName: sourceFile.getBaseName(),
		filePath: sourceFile.getFilePath(),
		unusedFunctions: [],
		unusedClasses: [],
		unusedProperties: [],
		unusedInterfaces: [],
		unusedTypes: [],
		unusedEnums: []
	}
	const classes = parseClasses(sourceFile.getClasses());

	if (sourceFileHasUnusedEntities(sourceFileEntity)) {
		unusedEntities.push(sourceFileEntity)
	}
});

function parseClasses(classes: ClassDeclaration[]): {properties: UnusedProperty[], functions: UnusedFunction[], classes: UnusedExtendable[]} {
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
		}else{
			returnObj.properties = parseProperties(clazz.getProperties());
			returnObj.functions = parseFunctions(clazz.getMethods())
		}
	});
	return returnObj;
}

function parseProperties(properties: PropertyDeclaration[]): UnusedProperty[] {
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

function parseFunctions(functions: MethodDeclaration[]): UnusedFunction[] {
	if (functions && functions.length) {
		const funcs: UnusedFunction[] = [];
		functions.forEach((func: MethodDeclaration) => {
			const references = func.findReferences();
			if (!references || !references.length) {
				const args = [];
				func.getParameters().forEach((param: ParameterDeclaration) => {
					const arg: ArgumentEntity = {
						name: param.getName(),
						type: param.getType().getText()
					};
					args.push(arg);
				});
				const unusedFunc: UnusedFunction = {
					name: func.getName(),
					arguments: args,
					type: func.getReturnType().getText()
				}
				funcs.push(unusedFunc);
			}
		});
		return funcs;
	}
	return [];
}

function sourceFileHasUnusedEntities(sourceFileEntity: UnusedSourceFileEntity) {
	if (sourceFileEntity) {
		let val = 0;
		val += sourceFileEntity.unusedClasses.length;
		val += sourceFileEntity.unusedEnums.length;
		val += sourceFileEntity.unusedFunctions.length;
		val += sourceFileEntity.unusedInterfaces.length;
		val += sourceFileEntity.unusedProperties.length;
		val += sourceFileEntity.unusedTypes.length;
		if (val > 0) {
			return true;
		}
	}
	return false;
}

/**
 * Typescript Types used throughout the application
 */

/**
 * Base DeadEntity
 */
export interface DeadEntity {
	name: string;
	type: string;
	lineNumber: number;
	entityType: DeadEntityType;
	sourceFile: string;
}

/**
 * Argument for a method or function
 */
export interface DeadArgumentEntity extends DeadEntity {
	functionName: string;
	parentName: string;
}

/**
 * A method or function
 */
export interface DeadMethodOrFunction extends DeadEntity {
	parentName: string;
}

/**
 * A class property
 */
export interface DeadProperty extends DeadEntity {
	parentName: string;
}

/**
 * A class or interface
 */
export interface DeadExtendable extends DeadEntity {
	extends: string;
}

/**
 * This is our consumable and describes all the unused
 * things in a source file
 */
export interface DeadSourceFileEntity {
	fileName: string;
	filePath: string;
	unusedFunctions: DeadMethodOrFunction[];
	unusedProperties: DeadProperty[];
	unusedInterfaces: DeadExtendable[];
	unusedClasses: DeadExtendable[];
	unusedTypes: DeadExtendable[];
	unusedEnums: DeadEntity[];
	unusedArguments: DeadArgumentEntity[];
}

/**
 * Defines the different types of entities we may encounter
 */
export enum DeadEntityType {
	CLASS = 'Class',
	PROPERTY = 'Property',
	ENUM = 'Enum',
	METHODORFUNCTION = 'MethodOrFunction',
	INTERFACE = 'Interface',
	ARGUMENT = 'Argument',
	OTHER = 'Other'
}

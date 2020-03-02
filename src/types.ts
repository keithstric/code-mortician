/**
 * Base UnusedEntity
 */
export interface UnusedEntity {
	name: string;
	type: string;
	lineNumber: number;
	entityType: EntityType;
}

/**
 * Argument for a method or function
 */
export interface ArgumentEntity extends UnusedEntity {
	functionName: string;
}

/**
 * A method or function
 */
export interface UnusedMethodOrFunction extends UnusedEntity {
	parentName: string;
}

/**
 * A class property
 */
export interface UnusedProperty extends UnusedEntity {
	parentName: string;
}

/**
 * A class or interface
 */
export interface UnusedExtendable extends UnusedEntity {
	extends: string;
}

/**
 * This is our consumable and describes all the unused
 * things in a source file
 */
export interface UnusedSourceFileEntity {
	fileName: string;
	filePath: string;
	unusedFunctions: UnusedMethodOrFunction[];
	unusedProperties: UnusedProperty[];
	unusedInterfaces: UnusedExtendable[];
	unusedClasses: UnusedExtendable[];
	unusedTypes: UnusedExtendable[];
	unusedEnums: UnusedEntity[];
}

export enum EntityType {
	CLASS = 'Class',
	PROPERTY = 'Property',
	ENUM = 'Enum',
	METHODORFUNCTION = 'MethodOrFunction',
	INTERFACE = 'Interface',
	ARGUMENT = 'Argument',
	OTHER = 'Other'
}

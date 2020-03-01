/**
 * Base UnusedEntity
 */
export interface UnusedEntity {
	name: string;
	type: string;
	lineNumber: number;
}

/**
 * Argument for a method or function
 */
export interface ArgumentEntity {
	name: string;
	type: string;
}

/**
 * A method or function
 */
export interface UnusedMethodOrFunction extends UnusedEntity {
	unusedArguments: ArgumentEntity[];
}

/**
 * A class property
 */
export interface UnusedProperty extends UnusedEntity {
	type: string;
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

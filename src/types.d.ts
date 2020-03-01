/**
 * Base UnusedEntity
 */
interface UnusedEntity {
	name: string;
	type: string;
	lineNumber: number;
}

/**
 * Argument for a method or function
 */
interface ArgumentEntity {
	name: string;
	type: string;
}

/**
 * A method or function
 */
interface UnusedMethodOrFunction extends UnusedEntity {
	unusedArguments: ArgumentEntity[];
}

/**
 * A class property
 */
interface UnusedProperty extends UnusedEntity {
	type: string;
}

/**
 * A class or interface
 */
interface UnusedExtendable extends UnusedEntity {
	extends: string;
}

/**
 * This is our consumable and describes all the unused
 * things in a source file
 */
interface UnusedSourceFileEntity {
	fileName: string;
	filePath: string;
	unusedFunctions: UnusedMethodOrFunction[];
	unusedProperties: UnusedProperty[];
	unusedInterfaces: UnusedExtendable[];
	unusedClasses: UnusedExtendable[];
	unusedTypes: UnusedExtendable[];
	unusedEnums: UnusedEntity[];
}

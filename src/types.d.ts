interface UnusedEntity {
	name: string;
	type: string;
	lineNumber: number;
}

interface ArgumentEntity {
	name: string;
	type: string;
}

interface UnusedMethodOrFunction extends UnusedEntity {
	unusedArguments: ArgumentEntity[];
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
	unusedFunctions: UnusedMethodOrFunction[];
	unusedProperties: UnusedProperty[];
	unusedInterfaces: UnusedExtendable[];
	unusedClasses: UnusedExtendable[];
	unusedTypes: UnusedExtendable[];
	unusedEnums: UnusedEntity[];
}

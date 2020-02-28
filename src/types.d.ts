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
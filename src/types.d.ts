interface UnusedEntity {
	name: string;
	type: string;
}

interface ArgumentEntity {
	name: string;
	type: string;
}

interface UnusedMethodOrFunction extends UnusedEntity {
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
	unusedFunctions: UnusedMethodOrFunction[];
	unusedProperties: UnusedProperty[];
	unusedInterfaces: UnusedExtendable[];
	unusedClasses: UnusedExtendable[];
	unusedTypes: UnusedExtendable[];
	unusedEnums: UnusedEntity[];
}

interface UnusedInterface {
	prop1: string;
}

export enum UnusedEnum {
	foo = 'foo'
}

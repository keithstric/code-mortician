export function sourceFileHasUnusedEntities(sourceFileEntity: UnusedSourceFileEntity) {
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

function unusedFunc() {
	console.log('unused');
}

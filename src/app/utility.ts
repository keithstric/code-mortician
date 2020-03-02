import {DeadSourceFileEntity} from "../types";
import {Node, ReferenceFindableNode} from "ts-morph";

export function sourceFileHasUnusedEntities(sourceFileEntity: DeadSourceFileEntity) {
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

import {DeadSourceFileEntity} from "../types";
import {Node, ReferencedSymbol, ReferenceFindableNode} from "ts-morph";

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

export function areCallersDead(refNode: ReferenceFindableNode) {
	let areCallersDead = true;
	if (refNode) {
		const callers: ReferencedSymbol[] = refNode.findReferences();
		if (callers && callers.length) {
			for (let caller of callers) {
				const callerRefs = caller.getReferences();
				if (callerRefs && callerRefs.length) {
					areCallersDead = false;
					break;
				}
			}
		}
	}
	return areCallersDead;
}

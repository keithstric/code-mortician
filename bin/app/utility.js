"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sourceFileHasUnusedEntities(sourceFileEntity) {
    if (sourceFileEntity) {
        var val = 0;
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
exports.sourceFileHasUnusedEntities = sourceFileHasUnusedEntities;

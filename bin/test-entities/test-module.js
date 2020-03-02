function someUsedFunction() {
    console.log('a used function');
}
function someUnusedFunction(arg1, arg2) {
    console.log('an unused function', arg1);
    someUsedFunction();
}
//# sourceMappingURL=test-module.js.map
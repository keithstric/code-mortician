function someUsedFunction() {
    console.log('a used function');
}

function someUnusedFunction(arg1: string, arg2: number) {
    console.log('an unused function', arg1);
    someUsedFunction();
}

function usedFunction() {
    console.log('a used function');
}

function unusedFunction(arg1: string, arg2: number) {
    console.log('an unused function', arg1);
    usedFunction();
}

interface UnusedInterface {
    prop1: string;
    prop2: number;
}

enum UnusedEnum {
    foo = 'foo'
}

export class UsedTestClass {
    private _prop1: string;
    private _prop2: number;

    func1(arg1: string, arg2: number) {
        console.log('some function')
    }
}

export class UnusedTestClass extends UsedTestClass {

}

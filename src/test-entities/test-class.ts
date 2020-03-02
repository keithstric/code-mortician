interface SomeInterface {
    prop1: string;
    prop2: number;
}

enum SomeEnum {
    foo = 'foo'
}

export class SomeUsedTestClass {
    private _prop1: string;
    private _prop2: number;

    func1(arg1: string, arg2: number) {
        console.log('some function')
    }
}

export class SomeUnusedTestClass extends SomeUsedTestClass {

}

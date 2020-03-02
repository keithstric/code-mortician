"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SomeEnum;
(function (SomeEnum) {
    SomeEnum["foo"] = "foo";
})(SomeEnum || (SomeEnum = {}));
var SomeUsedTestClass = /** @class */ (function () {
    function SomeUsedTestClass() {
    }
    SomeUsedTestClass.prototype.func1 = function (arg1, arg2) {
        console.log('some function');
    };
    return SomeUsedTestClass;
}());
exports.SomeUsedTestClass = SomeUsedTestClass;
var SomeUnusedTestClass = /** @class */ (function (_super) {
    __extends(SomeUnusedTestClass, _super);
    function SomeUnusedTestClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SomeUnusedTestClass;
}(SomeUsedTestClass));
exports.SomeUnusedTestClass = SomeUnusedTestClass;
//# sourceMappingURL=test-class.js.map
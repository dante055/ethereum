pragma solidity >=0.5.0 <0.7.0;
/*
contract Base
{
    event MyEvent(string _myString);
    function foo() virtual public {
        emit MyEvent("base");
    }
}

contract Middle is Base {
    
    function foo()  public virtual override {
        emit MyEvent("Middle");
    }
}

contract Inherited is Middle
{
    function foo() public override {
        emit MyEvent("Inherited");
    }
}
*/

/*
contract Base
{
    event MyEvent(string _myString);
    function foo() virtual public {
        emit MyEvent("base");
    }
}

contract Middle  is Base{
    // event MyEvent(string _myString);
    // function foo()  public virtual {
    //     emit MyEvent("Middle");
    // }
}

contract Inherited is Middle
{
    function foo() public override {
        emit MyEvent("Inherited");
    }
}
*/

pragma solidity >=0.5.0 <0.7.0;

contract Base1
{
    event MyEvent(string _myString);
    function foo() virtual public {
        emit MyEvent("base1");
    }
}

contract Base2
{
    event MyEvent(string _myString);
    function foo() virtual public {
        emit MyEvent("base2");
    }
}

contract Inherited is Base1, Base2
{
    // Derives from multiple bases defining foo(), so we must explicitly override it
    function foo() public override(Base1, Base2) {
        emit MyEvent("inherited");
        super.foo();    // will call base2 foo
    }
}
class test {
  constructor(data){
    this.data = data;
    this.print = () => {
      debugger;
      console.log(this.data);
    };
  }
}

module.exports = function(data){
  const foo = new test(data);
  return {
    print: foo.print.bind(foo),
  }
}
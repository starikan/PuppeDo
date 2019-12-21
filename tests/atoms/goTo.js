const instance = new (require('./Atom'))();
module.exports = { runTest: instance.runTest.bind(instance) };

// WRITE YOUR LOGIC BELLOW
instance.atomRun = async function() {
  const { url } = this.data;
  await this.page.goto(url);
  this.log({ text: `Go to: ${url}` });
};
const instance = new (require('./Atom'))();
module.exports = { runTest: instance.runTest.bind(instance) };

// WRITE YOUR LOGIC BELLOW
instance.atomRun = async function() {
  const { time } = this.data;
  this.log({ text: `Waiting ${time} ms.` });
  await this.page.waitFor(time);
};
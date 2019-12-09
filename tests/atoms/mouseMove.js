module.exports = {
  runTest: async function(args) {
    const { page, data, log, options, levelIndent, _ } = args;
    const screenshot = _.get(options, 'screenshot', false);
    const X = _.get(data, 'X');
    const Y = _.get(data, 'Y');
    const dX = _.get(data, 'dX');
    const dY = _.get(data, 'dY');

    const mouse = page.mouse;
    const mouseX = mouse._x;
    const mouseY = mouse._y;

    if (!_.isUndefined(dX) && !_.isUndefined(dY)) {
      await mouse.move(mouseX + dX, mouseY + dY, { steps: 50 });
      await log({
        text: `Мышь перемещена на расстоние X = ${dX}, Y = ${dY}`,
        screenshot: screenshot,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    } else if (!_.isUndefined(X) && !_.isUndefined(Y)) {
      await mouse.move(X, Y);
      await log({
        text: `Мышь перемещена на позицию X = ${X}, Y = ${Y}`,
        screenshot: screenshot,
        fullpage: false,
        level: 'raw',
        levelIndent: levelIndent + 1,
      });
    } else {
      throw {
        message: 'Не передан нужный набор параметров. Должно быть сочетания X-Y или dX-dY',
      };
    }
  },
};

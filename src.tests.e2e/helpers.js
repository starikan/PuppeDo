const entryCleaner = (entry) => {
  delete entry.stepId;
  delete entry.time;
  entry.screenshots = entry.screenshots.length;
  entry.text = entry.text.replace(/🕝: \d+\.\d+ s./, '');
  entry.text = entry.text.replace(/start on '[\d\-_\.]+?'/, '');
  return entry;
};

const logsCleaner = (logs) => {
  return Object.fromEntries(
    Object.entries(logs).map((v) => {
      v[1] = v[1].map(entryCleaner);
      return v;
    }),
  );
};

module.exports = { logsCleaner };

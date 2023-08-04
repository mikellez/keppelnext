/**
 * 
 * @param {"key": value} oldSchedule 
 * @param {"key": value} newSchedule 
 * @returns {Array} changes 
 */

function getFieldsDiff(oldSchedule, newSchedule) {
  const changes = [];
  // console.log(oldSchedule, newSchedule)
  const newScheduleLowerCase = Object.entries(newSchedule).reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {}
  );

  for (const key of Object.keys(newScheduleLowerCase)) {
    // console.log(key, oldSchedule[key], newScheduleLowerCase[key])
    if (
      oldSchedule[key] &&
      newScheduleLowerCase[key] &&
      oldSchedule[key].toString() !== newScheduleLowerCase[key].toString()
    ) {
      changes.push({
        field: key,
        oldValue: oldSchedule[key],
        newValue: newScheduleLowerCase[key],
      });
    }
  }

  return changes;
}

module.exports = {
  getFieldsDiff,
};

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


function userPermission(permission, permissions) {
  const excludePermission = permission.replace("can", "exclude");
  const ableAccess = permissions.includes(permission.trim());

  if(permission.substring(0, 3) === 'can' && ableAccess && permissions.includes(excludePermission)) return false;

  return ableAccess;
}

module.exports = {
  getFieldsDiff,
  userPermission
};

var utils = {
  addRemBodyClass: function(className, remove) {
    var cl = document.body.classList,
    hasClass = cl.contains(className);
    if (remove === false) {
      if (hasClass) {
        cl.remove(className);
      }
    } else {
      if (!hasClass) {
        cl.add(className);
      }
    }
    return cl;
  },

  addBodyClass: function(className) {
    return utils.addRemBodyClass(className, true);
  },

  removeBodyClass: function(className) {
    return utils.addRemBodyClass(className, false);
  },

  swapBodyClass: function(classNameRem,classNameAdd) {
    utils.removeBodyClass(classNameRem);
    return utils.addBodyClass(classNameAdd);
  }
};

module.exports = utils;
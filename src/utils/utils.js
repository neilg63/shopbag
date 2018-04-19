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
  },

  expandImagePath: function(src, key) {
    if (src.indexOf('/files/') < 0) {
      switch (key) {
        case 'orig':
          return '/files/' + src
         default:
          return '/files/styles/'+key+'/public/' + src
      }
    }
    return src
  },

  expandFilePath: function(path) {
    return utils.expandImagePath(src,'orig')
  },

  expandImageSize: function(sizes, key) {
    if (sizes instanceof Object && sizes !== null) {
      if (sizes.hasOwnProperty(key)) {
        return utils.expandImagePath(sizes[key], key);
      }
    }
  },

  expandImageOrig: function(sizes, key) {
    return utils.expandImageSize(sizes, 'orig');
  }
};

module.exports = utils;
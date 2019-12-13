var scrollInterval = null

var utils = {
  hasBodyClass: function (className) {
    var cl = document.body.classList;
    return cl.contains(className);
  },

  scrollTo: function (el, y, ms, ease) {
    y = y + el.scrollTop;
    var steps = 5,
      i = steps,
      time = ms || 250,
      ydiff = y - el.scrollTop,
      fx = ease ? ease : function (i, steps) {
        return Math.pow(2, i)
      };
    if (scrollInterval) {
      clearInterval(scrollInterval);
    }
    var divisor = 1;
    scrollInterval = setInterval(function () {
      i -= 1;
      divisor = fx(i, steps);

      el.scroll(0, (ydiff / divisor) + el.scrollTop);

      // last step
      if (0 === i) {
        clearInterval(scrollInterval);
        el.scroll(0, y)
      }
    }, time / steps)
  },

  addRemBodyClass: function (className, remove) {
    var cl = document.body.classList,
      hasClass = cl.contains(className)
    if (remove === false) {
      if (hasClass) {
        cl.remove(className)
      }
    } else {
      if (!hasClass) {
        cl.add(className)
      }
    }
    return cl
  },

  addBodyClass: function (className) {
    return utils.addRemBodyClass(className, true);
  },

  removeBodyClass: function (className) {
    return utils.addRemBodyClass(className, false);
  },

  swapBodyClass: function (classNameRem, classNameAdd) {
    utils.removeBodyClass(classNameRem);
    return utils.addBodyClass(classNameAdd);
  },

  expandImagePath: function (src, key) {
    if (src.indexOf('/files/') < 0) {
      switch (key) {
        case 'orig':
          return '/files/' + src
        default:
          return '/files/styles/' + key + '/public/' + src
      }
    }
    return src
  },

  expandFilePath: function (path) {
    return utils.expandImagePath(src, 'orig')
  },

  expandImageSize: function (sizes, key) {
    if (sizes instanceof Object && sizes !== null) {
      if (sizes.hasOwnProperty(key)) {
        return utils.expandImagePath(sizes[key], key)
      }
    }
  },

  expandImageOrig: function (sizes, key) {
    return utils.expandImageSize(sizes, 'orig')
  },

  cleanString: function (str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
  },

  get: function (path) {
    return document.querySelector(path)
  },

  clickEl: function (path) {
    const el = document.querySelector(path)
    if (el) {
      el.click();
    }
    return el;
  },

  getStored: function (key, defVal) {
    let vl = localStorage.getItem(key);
    if (typeof key == 'string') {
      if (vl.indexOf('{') === 0 && vl.indexOf('}') > 1) {
        vl = JSON.parse(vl)
      }
    }
    if (vl === undefined || vl === null) {
      vl = defVal
    }
    return vl
  },

  getCookie: function (name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null
  },

  setCookie: function (name, value, days) {
    var d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
  }

};

module.exports = utils
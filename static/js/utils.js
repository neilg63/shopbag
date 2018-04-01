var addRemBodyClass = function(className, remove) {
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
}

var addBodyClass = function(className) {
  return addRemBodyClass(className, true);
}

var removeBodyClass = function(className) {
  return addRemBodyClass(className, false);
}

var swapBodyClass = function(classNameRem,classNameAdd) {
  removeBodyClass(classNameRem)
  return addBodyClass(classNameAdd);
}
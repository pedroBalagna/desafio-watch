function readPackage(pkg, context) {
  if (pkg.name === 'bcrypt') {
    pkg.scripts = pkg.scripts || {};
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};

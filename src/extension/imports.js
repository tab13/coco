// ES2015 simplified version
export default (...modules) => Promise.all(
  // flatten arguments to enable both
  // imports([m1, m2]) or imports(m1, m2)
  modules.concat.apply([], modules)
  // and per each resolved module
  // return its default
    .map(m => Promise.resolve(m).then(m => {
      return m.default
    }))
);
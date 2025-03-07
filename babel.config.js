module.exports = function (api) {
  api.cache(true);
  const plugins = [
    "@babel/plugin-transform-flow-strip-types",
    "@babel/plugin-transform-class-static-block",
    ["@babel/plugin-transform-class-properties", { loose: true }],
    ["@babel/plugin-transform-private-methods", { loose: true }],
    ["@babel/plugin-transform-private-property-in-object", { loose: true }],
  ];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};

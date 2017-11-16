module.exports = {
  "env": {
      "browser": true,
      "commonjs": true,
      "es6": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
      "sourceType": "module"
  },
  "rules": {
      "indent": [
          "error",
          4
      ],
      "linebreak-style": [
          "error",
          "windows"
      ],
      "quotes": [
          "error",
          "single"
      ],
      "semi": [
          "error",
          "always"
      ],
      "no-var": 1, 
      "comma-spacing":2,
      "arrow-spacing":2
  }
};
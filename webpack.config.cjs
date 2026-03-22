const fs = require('fs');
const path = require('path');

class CopyStaticPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CopyStaticPlugin', () => {
      const rootDir = compiler.context;
      const distDir = path.join(rootDir, 'dist');
      const htmlSource = path.join(rootDir, 'index.html');
      const cssSource = path.join(rootDir, 'css');
      const assetsSource = path.join(rootDir, 'assets');
      const htmlOutput = path.join(distDir, 'index.html');

      fs.mkdirSync(distDir, { recursive: true });

      const html = fs.readFileSync(htmlSource, 'utf8')
        .replace('./css/style.css', './css/style.css')
        .replace('<script type="module" src="./js/main.js"></script>', '<script defer src="./bundle.js"></script>');

      fs.writeFileSync(htmlOutput, html, 'utf8');
      fs.cpSync(cssSource, path.join(distDir, 'css'), { recursive: true, force: true });
      fs.cpSync(assetsSource, path.join(distDir, 'assets'), { recursive: true, force: true });
    });
  }
}

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './js/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: 'auto',
  },
  devtool: 'source-map',
  plugins: [new CopyStaticPlugin()],
  target: ['web', 'es2020'],
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: 'all',
    static: {
      directory: path.resolve(__dirname, 'dist'),
      watch: true,
    },
    devMiddleware: {
      writeToDisk: true,
    },
    watchFiles: [
      path.resolve(__dirname, 'index.html'),
      path.resolve(__dirname, 'css/**/*'),
      path.resolve(__dirname, 'assets/**/*'),
      path.resolve(__dirname, 'js/**/*'),
    ],
    hot: false,
    liveReload: true,
  },
};

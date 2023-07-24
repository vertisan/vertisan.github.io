const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const generateHtmlPlugins = ({ templatesPath, options = {} }) => {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templatesPath));
  const htmlFiles = templateFiles.filter(templateFile => {
    const parts = templateFile.split('.');
    return parts[1] === 'html';
  });

  return htmlFiles.map(htmlFile => {
    const [name, extension] = htmlFile.split('.');

    return new HtmlWebpackPlugin({
      title: options.title,
      filename: `${name}.html`,
      template: path.resolve(
        __dirname,
        `${templatesPath}/${name}.${extension}`,
      ),
      inject: true,
      custom: options,
    });
  });
};

module.exports = generateHtmlPlugins;

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const generateHtmlPlugins = require('./helpers/generateHtmlPlugins');

const projectRootDir = process.cwd();
const version = require('../package.json').version;
const title = 'VRS-Factory';
const templatesPath = path.join(projectRootDir, 'src', 'html', 'views');
const config = {
  templatesPath,
  options: {
    version,
    title,
  },
};
const isProd = process.argv.mode === 'production';
const htmlPlugins = generateHtmlPlugins(config);

module.exports = {
  resolve: {
    alias: {
      source: path.join('..', 'src'),
    },
  },
  mode: isProd ? 'production' : 'development',
  entry: {
    bundle: './src/js/index.js',
    libs: ['picturefill'],
    style: './src/scss/style.scss',
  },
  devtool: 'inline-source-map',
  devServer: {
    port: 9001,
    hot: true,
    compress: true,
    watchFiles: ['src/**'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [['autoprefixer']],
              },
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.html$/,
        include: path.resolve(__dirname, '../src/html/includes'),
        use: ['raw-loader'],
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new SpriteLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].min.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/img',
          to: './img',
        },
        {
          from: 'gpg.txt',
          to: './',
        },
        {
          from: '.well-known',
          to: './.well-known',
        },
      ],
    }),
    new ImageminPlugin({
      test: 'src/img/**',
      optimizationLevel: 3,
      progressive: true,
    }),
    new ImageminWebpWebpackPlugin({
      config: [
        {
          test: /\.(jpe?g|png)/,
          options: {
            quality: 85,
          },
        },
      ],
      overrideExtension: true,
      detailedLogs: false,
      silent: false,
      strict: true,
    }),
  ].concat(htmlPlugins),
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, '../build'),
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
    },
    minimizer: isProd
      ? [
          new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: false,
          }),
        ]
      : [],
  },
};

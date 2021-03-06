/*
 * This file is part of the Distribution library.
 *
 * Copyright (c) 2015-2016 LIN3S <info@lin3s.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @author Beñat Espiña <bespina@lin3s.com>
 */

'use strict';

import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import {join} from 'path';
import precss from 'precss';
import Webpack from 'webpack';

import Modernizr from './Plugins/Modernizr';
import SvgStore from './Plugins/SvgStore';
import UglifyJs from './Plugins/UglifyJs';

const
  rootPath = './../../../..',
  esLintDefaultOptions = {
    configFile: join(__dirname, `${rootPath}/.eslint.yml`)
  };

const isProdEnvironment = (options) => {
  return typeof options !== 'undefined' && options.env === 'prod';
};

const optionsOf = (plugin, options) => {
  let defaultOptions;
  if (typeof options.plugins !== 'undefined' && typeof options.plugins[plugin] !== 'undefined') {
    defaultOptions = options.plugins[plugin];
  }

  return defaultOptions;
};

const cssFilename = (options) => {
  const name = (isProdEnvironment(options) === true) && (typeof options.output.cssFilenameProduction !== 'undefined')
    ? options.output.cssFilenameProduction
    : options.output.cssFilename;

  return `${options.output.cssPath}/${name}`;
};

const jsFilename = (options) => {
  return (isProdEnvironment(options) === true) && (typeof options.output.jsFilenameProduction !== 'undefined')
    ? options.output.jsFilenameProduction
    : options.output.jsFilename;
};

const getPlugins = (options) => {
  const plugins = [
    SvgStore(optionsOf('svgStore', options)),
    new ExtractTextPlugin(cssFilename(options)),
    new Webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          autoprefixer(options.postcss.autoprefixer),
          precss
        ],
        sassLoader: {
          includePaths: [join(__dirname, options.input.scss)]
        },
        eslint: typeof options.eslint === 'undefined' ? esLintDefaultOptions : optionsOf('eslint', options)
      }
    })
  ];

  if (typeof options.manifest !== 'undefined') {
    plugins.push(new ManifestPlugin({fileName: options.manifest}));
  }

  if (isProdEnvironment(options)) {
    plugins.push(UglifyJs(optionsOf('uglifyjs', options)));
    plugins.push(Modernizr(optionsOf('modernizr', options)));
  }

  return plugins;
};

const getRules = (include, options) => {
  const rules = [{
    test: /\.jsx?$/,
    include: include,
    exclude: /(node_modules|bower_components)/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [
            "react",
            "es2015",
            "stage-2"
          ],
          compact: false
        }
      }, {
        loader: 'eslint-loader',
        options: {
          enforce: 'pre'
        }
      }
    ]
  }, {
    test: /\.json$/,
    use: 'json-loader'
  }, {
    test: /\.(s?css)$/,
    loader: ExtractTextPlugin.extract({
      publicPath: typeof options.output.cssPublicPath === 'undefined' ? '/' : options.output.cssPublicPath,
      fallbackLoader: 'style-loader',
      loader: ['css-loader', 'postcss-loader', 'sass-loader']
    })
  }];

  if (typeof options.module !== 'undefined' && typeof options.module.rules !== 'undefined') {
    if (options.module.rules instanceof Array) {
      options.module.rules.forEach(function (rule) {
        rules.push(rule);
      })
    } else {
      rules.push(options.module.rules);
    }
  }

  return rules;
};

export default (customOptions) => {
  const include = join(__dirname, `${rootPath}/${customOptions.input.base}`);

  return (webpackOptions) => {
    const options = typeof webpackOptions === 'undefined'
      ? customOptions
      : Object.assign(webpackOptions, customOptions);

    return {
      entry: options.entry,
      output: {
        path: options.output.jsPath,
        publicPath: typeof options.output.jsPublicPath === 'undefined'
          ? options.output.jsPath
          : options.output.jsPublicPath,
        filename: jsFilename(options),
      },
      module: {
        rules: getRules(include, options),
      },
      resolve: {
        modules: [
          include,
          'node_modules'
        ],
        extensions: [
          '.js',
          '.json',
          '.jsx',
          '.css',
          '.scss',
          '.svg'
        ],
        alias: options.alias,
      },
      plugins: getPlugins(options),
      devtool: isProdEnvironment(options) ? false : 'source-map'
    };
  }
}

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

import webpack from 'webpack';

const
  defaultOptions = {
    compress: {
      warnings: false
    }
  },
  UglifyJs = (options = defaultOptions) => {
    return new webpack.optimize.UglifyJsPlugin(options)
  };

export default UglifyJs;

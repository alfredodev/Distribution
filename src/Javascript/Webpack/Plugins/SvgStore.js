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

import WebpackSvgStore from 'webpack-svgstore-plugin';

const
  defaultOptions = {
    prefix: '',
    svgoOptions: {
      plugins: [
        {removeTitle: true},
        {removeUselessStrokeAndFill: true},
        {cleanupNumericValues: {floatPrecision: 2}}
      ]
    }
  }, SvgStore = (options = defaultOptions) => {
    return new WebpackSvgStore(options);
  };

export default SvgStore;

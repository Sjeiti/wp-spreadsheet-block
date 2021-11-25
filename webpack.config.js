const path = require('path')
const webpack = require('webpack')
module.exports = env => {

  const isProduction = !!env&&env.production
  const mode = isProduction?'production':'development'

  return {
    mode
    ,entry: './src/js/index.js'
    ,output: {
      filename: 'index.js'
      ,path: path.resolve(__dirname,'httpdocs/wp-content/plugins/footprint/')
    }
    ,devServer: {
      static: {
        directory: path.join(__dirname, 'src')
      }
      ,compress: true,
      port: 9000
    }
    ,devtool: 'source-map'
    ,module: {
      rules: [
      {
        test: /\.js$/
        ,exclude: /node_modules/
        ,use: {
          loader: 'babel-loader'
          ,options: { babelrc: true }
        }
      }
      ]
    }
    ,plugins: [
      new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer']
      })
      ,new webpack.ProvidePlugin({
         process: 'process/browser',
      })
    ]
    ,resolve: {
      fallback: {
        stream: require.resolve('stream-browserify')
        ,buffer: require.resolve('buffer')
      }
    }
  }
}

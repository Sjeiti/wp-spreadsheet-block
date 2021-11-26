const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = env => {

  const isProduction = !!env&&env.production
  const mode = isProduction?'production':'development'

  const targetFileName = 'index.js'
  const targetDir = path.resolve(__dirname, 'httpdocs/wp-content/plugins/footprint/')
  const targetFile = path.resolve(targetDir, targetFileName)
  const testFile = path.resolve(__dirname, 'src', targetFileName)

  return {
    mode
    ,entry: './src/js/index.js'
    ,output: {
      filename: targetFileName
      ,path: targetDir
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
      ,new CopyPlugin({
        patterns: [
          { from: targetFile, to: testFile }
          // { from: "other", to: "public" }
        ],
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

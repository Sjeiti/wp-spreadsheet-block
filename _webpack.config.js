const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

const pluginPath = 'httpdocs/wp-content/plugins/spreadsheet-block/public/js'

module.exports = env => {

  const isProduction = !!env&&env.production
  const mode = isProduction?'production':'development'

  const targetFileName = 'index.js'
  const targetDir = path.resolve(__dirname, pluginPath)
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
        ,{
          test: /\.scss$/
          ,use: ["style-loader", "css-loader", "sass-loader"]
        }
        ,{
          test: /\.(eot|woff|woff2|ttf|png|jp(e*)g|svg)$/
          ,use: [{
              loader: 'url-loader'
              ,options: {
                  limit: 8000 // Convert images < 8kb to base64 strings
                  ,name: `img/[name]-[hash].[ext]`
              }
          }]
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

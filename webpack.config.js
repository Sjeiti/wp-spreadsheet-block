const path = require('path')
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
    ,plugins: []
    ,resolve: {
      fallback: {
        stream: require.resolve('stream-browserify')
        ,buffer: require.resolve('buffer')
      }
    }
  }
}

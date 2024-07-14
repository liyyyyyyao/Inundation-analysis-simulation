const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
const { defineConfig } = require('@vue/cli-service')

let cesiumSource = './node_modules/cesium/Source'
let cesiumWorkers = '../Build/Cesium/Workers'

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = defineConfig({
    publicPath:'/cesiumLesson',
    outputDir: "dist",
    lintOnSave: true,
    devServer: {
        open: process.platform === "darwin",
        host: "0.0.0.0",
        port: 8088,
        https: false,
        proxy: {
            '/api': {
              target: 'http://localhost:8091',	//实际请求地址
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, 'api') //http://localhost:8091/api
            },
        }
    },
    configureWebpack: {
        output: {
            sourcePrefix: ' '
        },
        amd: {
            toUrlUndefined: true
        },
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.cjs.js',
                '@': path.resolve('src'),
                'cesium': path.resolve(__dirname, cesiumSource)
            },
            fallback: {
                 "http": require.resolve("stream-http"),
                 "https": require.resolve("https-browserify"),
                "zlib": require.resolve("browserify-zlib"),
                 "url": require.resolve("url/"),
                 "assert": require.resolve("assert/"),
                "stream": require.resolve("stream-browserify")
            }
        },
        plugins: [
            new CopyWebpackPlugin({ patterns: [{ from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' }] }),
            new CopyWebpackPlugin({ patterns: [{ from: path.join(cesiumSource, 'Assets'), to: 'Assets' }] }),
            new CopyWebpackPlugin({ patterns: [{ from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }] }),
            new CopyWebpackPlugin({ patterns: [{ from: path.join(cesiumSource, 'ThirdParty/Workers'), to: 'ThirdParty/Workers' }] }),
            new webpack.DefinePlugin({
                CESIUM_BASE_URL: JSON.stringify('./')
            })
        ],
        module: {
            unknownContextCritical: /^.\/.*$/,
            unknownContextCritical: false
        }
    }
})
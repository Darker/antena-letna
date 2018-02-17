const path = require('path');
const webpack = require('webpack');
const fs = require("fs");
// default build info
//var build_info = {
//    build_number: "DEVELOPMENT-UNDEFINED"
//};
//// execute prebuild script
//try {
//    build_info = require("./prebuild.js")();
//}
//catch (error) {
//    console.log("Pre-build actions failed! See the error:" + error.message);
//    console.log(error.stack);
//    process.exit(1);
//}



module.exports = {
    entry: {
        //'voxsnap': "./voxsnap_player_fast.js",
        //'voxsnap.min': "./voxsnap_player_fast.js",
        'main.babel': "./web/main.js",
        'main.babel.min': "./web/main.js"
    },
    output: {
        path: path.resolve(__dirname, './web/dist'),
        filename: '[name].js'
    },
    devtool: "source-map",
    //resolve: {
    //    modules: [
    //        //path.resolve(__dirname, 'voxsnap'),
    //        "node_modules",
    //        //path.resolve('.'),
    //    ]
    //},
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.([a-zA-Z0-9]+\.)?js$/,
            minimize: true,
            sourceMap: true
        }),
        new webpack.DefinePlugin({
            //__VERSION__: build_info.build_number,
            //VOXSNAP_BASE_REQUIRE_PATH: "./voxsnap/",
            //__REQUIRE_PATH: "./voxsnap/",
        })
    ]
}

({
    baseUrl: "scripts/",
    mainConfigFile: 'scripts/main.js',
    name: "main",
    out: "../public/roomies.min.js",
    optimize: "uglify2",
    uglify2: {
        output: {
            // beautify: false
            beautify: true
        },
        compress: {
            // sequences: true,
            sequences: false,
            global_defs: {
                DEBUG: false
            }
        },
        warnings: true,
        // mangle: true
        mangle: false
    }
})



    
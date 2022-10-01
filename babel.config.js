module.exports = api => {
    const isTest = api.env("test");

    return isTest ? {
        presets: [
            [
                "@babel/preset-env",
                {
                    targets: {
                        node: "current",
                    },
                }
            ]
        ],
        plugins: [
            "@babel/plugin-transform-modules-commonjs",
        ]
    } : {
        presets: [
            [
                "babel-preset-gatsby",
                {
                    "targets": {
                        "browsers": [">0.25%", "not dead"]
                    }
                }
            ]
        ]
    }
};
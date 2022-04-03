var canvas = null;
var context = null;
var cardTitle = null;

var canvasWidth = 1400;

const randomBetween = (min, max) =>
    min + Math.floor(Math.random() * (max - min + 1));

const randomFloatBetween = (min, max) =>
    Number((Math.random() * (max - min) + min).toFixed(17));

const FONTS = ["Shrikhand", "Shrikhand", "Shrikhand"];

const COORDS = [
    {
        xCartMax: -0.6590666666666665,
        xCartMin: -0.8126666666666665,
        yCartMax: -0.1488,
        yCartMin: -0.24480000000000005,
    },
    {
        xCartMin: -0.7371466666666665,
        xCartMax: -0.7064266666666665,
        yCartMin: -0.20544,
        yCartMax: -0.18624000000000002,
    },
    {
        xCartMin: -0.7275781420765026,
        xCartMax: -0.7214509289617484,
        yCartMin: -0.19974295081967214,
        yCartMax: -0.1921888524590164,
    },
    {
        xCartMin: -0.7277980502732239,
        xCartMax: -0.7265692502732239,
        yCartMin: -0.19551265573770493,
        yCartMax: -0.19400183606557378,
    },
    {
        xCartMin: -0.9448196721311476,
        xCartMax: -0.17681967213114735,
        yCartMin: -1.1016393442622952,
        yCartMax: -0.1573770491803277,
    },
    {
        xCartMin: -0.021540983606557373,
        xCartMax: 0.7464590163934424,
        yCartMin: -1.043934426229508,
        yCartMax: -0.09967213114754125,
    },
    {
        xCartMin: 0.4201219672131147,
        xCartMax: 0.4508419672131147,
        yCartMin: -0.35588196721311494,
        yCartMax: -0.31811147540983625,
    },
    {
        xCartMin: -2.57,
        xCartMax: 1.2699999999999998,
        yCartMin: -2.360655737704918,
        yCartMax: 2.360655737704918,
    },
    {
        xCartMin: -1.3508944262295082,
        xCartMax: -1.3201744262295083,
        yCartMin: 0.049311475409836186,
        yCartMax: 0.08708196721311488,
    },
    {
        xCartMin: -1.3296254426229508,
        xCartMax: -1.3234814426229509,
        yCartMin: 0.057704918032787,
        yCartMax: 0.06525901639344275,
    },
    {
        xCartMin: -0.5622099291537545,
        xCartMax: -0.5621958689868891,
        yCartMin: -0.6428203169106079,
        yCartMax: -0.6428141729106078,
    },
    {
        xCartMin: -0.5622059015017878,
        xCartMax: -0.5622030894684148,
        yCartMin: -0.6428161713582836,
        yCartMax: -0.6428149425582836,
    },
    {
        xCartMin: 0.3192910607866508,
        xCartMax: 0.32807866507747324,
        yCartMin: -0.03830617401668648,
        yCartMax: -0.03446617401668647,
    },
    {
        xCartMin: 0.3210440047675805,
        xCartMax: 0.322801525625745,
        yCartMin: -0.03560535876042902,
        yCartMax: -0.03483735876042902,
    },
    {
        xCartMin: 0.32125179499404055,
        xCartMax: 0.3216032991656735,
        yCartMin: -0.0352079942789034,
        yCartMax: -0.03505439427890338,
    },
    {
        xCartMin: 0.32136621692491063,
        xCartMax: 0.3214365177592372,
        yCartMin: -0.03513877358760423,
        yCartMax: -0.03510805358760422,
    },
    {
        xCartMin: 0.32137632266984506,
        xCartMax: 0.3213903828367104,
        yCartMin: -0.03512811495589982,
        yCartMax: -0.035121970955899806,
    },
    {
        xCartMin: 0.321381053330155,
        xCartMax: 0.32138386536352803,
        yCartMin: -0.03512530219022639,
        yCartMax: -0.0351240733902264,
    },
    {
        xCartMin: -1.3634207389749702,
        xCartMax: -1.1437306317044098,
        yCartMin: 0.2981263408820024,
        yCartMax: 0.3941263408820025,
    },
    {
        xCartMin: -1.2662994040524433,
        xCartMax: -1.257511799761621,
        yCartMin: 0.35290240762812886,
        yCartMax: 0.3567424076281288,
    },
    {
        xCartMin: -1.2617053177592372,
        xCartMax: -1.2616350169249106,
        yCartMin: 0.3557684664600716,
        yCartMax: 0.3557991864600716,
    },
];

const colors = [
    {
        red: randomBetween(0, 255),
        green: randomBetween(0, 255),
        blue: randomBetween(0, 255),
    },
    {
        red: randomBetween(0, 255),
        green: randomBetween(0, 255),
        blue: randomBetween(0, 255),
    },
    {
        red: randomBetween(0, 255),
        green: randomBetween(0, 255),
        blue: randomBetween(0, 255),
    },
    {
        red: randomBetween(0, 255),
        green: randomBetween(0, 255),
        blue: randomBetween(0, 255),
    },
    {
        red: randomBetween(0, 255),
        green: randomBetween(0, 255),
        blue: randomBetween(0, 255),
    },
    {
        red: randomBetween(0, 255),
        green: randomBetween(0, 255),
        blue: randomBetween(0, 255),
    },
    {
        red: randomBetween(0, 255),
        green: randomBetween(0, 255),
        blue: randomBetween(0, 255),
    },
];

function Fractal(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cords = {};
    this.maxEscapeTime = 0;
    this.startCords = {};
    this.startMaxEscapeTime = 0;
    this.setToDefaults();
    this.alignCordsToCanvasRatio();
}

Fractal.prototype.update = function (options) {
    var previousSettings = this.copyCurrentSettings();

    if (options.defaults) this.setToDefaults(); // true/false
    if (options.resetToDefaultCords) this.resetToDefaultCords(); // true/false
    if (options.resetCords) this.setCords(this.startCords); // true/false
    if (options.cords) this.setCords(options.cords);
    if (options.resetMaxEscapeTime)
        this.setMaxEscapeTime(this.startMaxEscapeTime); // true/false
    if (options.maxEscapeTime) this.setMaxEscapeTime(options.maxEscapeTime);
    if (options.zoomInPxPoint) this.zoomInPxPoint(options.zoomInPxPoint);
    if (options.zoomOutPxPoint) this.zoomOutPxPoint(options.zoomOutPxPoint);
    if (options.zoomInPxBox) this.zoomInPxBox(options.zoomInPxBox);
    if (options.setAsStartingOptions) this.setStartingOptions(); // true/false
    if (options.pxWidth && Math.floor(options.pxWidth) !== this.canvas.width)
        this.canvas.width = options.pxWidth;
    if (options.pxHeight && Math.floor(options.pxHeight) !== this.canvas.height)
        this.canvas.height = options.pxHeight;
    if (!options.distortion) this.alignCordsToCanvasRatio(); // by default this will run
    if (this.reDrawRequired(previousSettings)) this.draw();
};

Fractal.prototype.copyCurrentSettings = function () {
    return {
        cords: JSON.parse(JSON.stringify(this.cords)),
        maxEscapeTime: this.maxEscapeTime,
        canvasWidth: this.canvas.width,
        canvasHeight: this.canvas.height,
    };
};

Fractal.prototype.reDrawRequired = function (previousSettings) {
    if (
        previousSettings.maxEscapeTime === this.maxEscapeTime &&
        previousSettings.canvasWidth === this.canvas.width &&
        previousSettings.canvasHeight === this.canvas.height &&
        previousSettings.cords.xCartMin === this.cords.xCartMin &&
        previousSettings.cords.xCartMax === this.cords.xCartMax &&
        previousSettings.cords.yCartMin === this.cords.yCartMin &&
        previousSettings.cords.yCartMax === this.cords.yCartMax
    ) {
        return false;
    } else {
        return true;
    }
};

Fractal.prototype.setToDefaults = function () {
    this.resetToDefaultCords();
    this.maxEscapeTime = 224;
    this.setStartingOptions();
};

Fractal.prototype.resetToDefaultCords = function () {
    this.setCords({
        xCartMin: -2.1,
        xCartMax: 0.8,
        yCartMin: -1.2,
        yCartMax: 1.2,
    });
    this.startCords = JSON.parse(JSON.stringify(this.cords));
};

Fractal.prototype.setCords = function (cords) {
    var properties = ["xCartMin", "xCartMax", "yCartMin", "yCartMax"];

    properties.forEach(function (property) {
        if (!Number.isFinite(cords[property])) {
            throw (
                "Error with " +
                property +
                " cord, its value is: " +
                cords[property]
            );
        }
    });

    properties.forEach(
        function (property) {
            this.cords[property] = cords[property];
        }.bind(this)
    );
};

Fractal.prototype.setMaxEscapeTime = function (maxEscapeTime) {
    if (maxEscapeTime > 1792) {
        this.maxEscapeTime = 1792;
    } else if (maxEscapeTime < 14) {
        this.maxEscapeTime = 14;
    } else {
        this.maxEscapeTime = Math.floor(maxEscapeTime / 7) * 7;
    }
};

Fractal.prototype.zoomInPxPoint = function (pxPoint) {
    var zoomMultiple = 0.2;
    this.determineZoomPxCords(zoomMultiple, pxPoint);
};

Fractal.prototype.zoomOutPxPoint = function (pxPoint) {
    var zoomMultiple = 5;
    this.determineZoomPxCords(zoomMultiple, pxPoint);
};

Fractal.prototype.zoomInPxBox = function (pxCords) {
    this.convertPxCordsToCartCords(pxCords);
};

Fractal.prototype.determineZoomPxCords = function (zoomMultiple, pxPoint) {
    var diffPxWidth = Math.floor(this.canvas.width * (zoomMultiple / 2));
    var diffPxHeight = Math.floor(this.canvas.height * (zoomMultiple / 2));

    var pxCords = {
        xPxMin: pxPoint.xPx - diffPxWidth,
        xPxMax: pxPoint.xPx + diffPxWidth,
        yPxMin: pxPoint.yPx - diffPxHeight,
        yPxMax: pxPoint.yPx + diffPxHeight,
    };

    this.convertPxCordsToCartCords(pxCords);
};

Fractal.prototype.convertPxCordsToCartCords = function (pxCords) {
    var newCartCords = {
        xCartMin: this.pixelToCartX(pxCords.xPxMin),
        xCartMax: this.pixelToCartX(pxCords.xPxMax),
        yCartMin: this.pixelToCartY(pxCords.yPxMin),
        yCartMax: this.pixelToCartY(pxCords.yPxMax),
    };

    this.setCords(newCartCords);
};

Fractal.prototype.setStartingOptions = function () {
    this.startCords = JSON.parse(JSON.stringify(this.cords));
    this.startMaxEscapeTime = this.maxEscapeTime;
};

Fractal.prototype.alignCordsToCanvasRatio = function () {
    var ctWidth = this.cords.xCartMax - this.cords.xCartMin;
    var ctHeight = this.cords.yCartMax - this.cords.yCartMin;
    var pxWidth = this.canvas.width;
    var pxHeight = this.canvas.height;
    if (ctHeight / ctWidth === pxHeight / pxWidth) return;

    if (ctHeight / ctWidth < pxHeight / pxWidth) {
        var oldCtHeight = ctHeight;
        ctHeight = ctWidth * (pxHeight / pxWidth);
        var diff = ctHeight - oldCtHeight;
        this.cords.yCartMax += diff / 2;
        this.cords.yCartMin -= diff / 2;
    } else {
        var oldCtWidth = ctWidth;
        ctWidth = ctHeight * (pxWidth / pxHeight);
        diff = ctWidth - oldCtWidth;
        this.cords.xCartMax += diff / 2;
        this.cords.xCartMin -= diff / 2;
    }
};

Fractal.prototype.pixelToCartX = function (x) {
    var pxRatio = x / this.canvas.width;
    var cartWidth = this.cords.xCartMax - this.cords.xCartMin;
    return this.cords.xCartMin + cartWidth * pxRatio;
};

Fractal.prototype.pixelToCartY = function (y) {
    var pxRatio = y / this.canvas.height;
    var cartHeight = this.cords.yCartMax - this.cords.yCartMin;
    return this.cords.yCartMin + cartHeight * pxRatio;
};

Fractal.prototype.draw = function () {
    var imageData = this.drawToImageData();
    this.ctx.putImageData(imageData, 0, 0);

    // use the following to print size on canvas for debugging
    // var fontSize = 1.25 * devicePixelRatio;
    // this.ctx.font="300 " + fontSize + "em Helvetica";
    // this.ctx.fillStyle = "#c0c0c0";
    // this.ctx.fillText("w: " + imageData.width + " h: " + imageData.height, 75 * devicePixelRatio, 165 * devicePixelRatio);
};

Fractal.prototype.drawToImageData = function () {
    var imageData = new ImageData(this.canvas.width, this.canvas.height);
    var yCart, xCart, escapeTime, rgbNum, index;

    for (var y = 0; y < imageData.height; y++) {
        yCart = this.pixelToCartY(y);

        for (var x = 0; x < imageData.width; x++) {
            xCart = this.pixelToCartX(x);
            escapeTime = this.calcEscapeTime(xCart, yCart);

            rgbNum = this.rgbNum(escapeTime);

            // debugging console log
            //

            index = (y * imageData.width + x) * 4;
            imageData.data[index] = rgbNum[0];
            imageData.data[index + 1] = rgbNum[1];
            imageData.data[index + 2] = rgbNum[2];
            imageData.data[index + 3] = 255;
        }
    }

    return imageData;
};

Fractal.prototype.calcEscapeTime = function (xCart, yCart) {
    var escapeTime = 0;
    var oldX = xCart;
    var oldY = yCart;
    var newX, newY;

    while (
        this.distFromOrigin(oldX, oldY) < 2 &&
        escapeTime < this.maxEscapeTime
    ) {
        newX = oldX * oldX - oldY * oldY + xCart;
        newY = 2 * oldX * oldY + yCart;

        oldX = newX;
        oldY = newY;

        escapeTime += 1;
    }

    return escapeTime;
};

Fractal.prototype.distFromOrigin = function (x, y) {
    return Math.sqrt(x * x + y * y);
};

///////////////////////////////////////////////////////////////////////////////
//coloring algorithim:
//start with 2 of the 3 red, green and blue values fixed at either 0 or 255,
//then increase the other R, G or B value in a given number of increments
//repeat this for seven cases and you get a maximum of 1792 colors (7*256)
//note that white repeats 3 times, at the end of cases 2, 4 and 6
//the seven case are:
//case 0: R=0, B=0, increase green from 0 to 255
//case 1: R=0 G=255, increase blue from 0 to 255
//case 2: G=255, B=255, increase red form 0 to 255
//case 3: G=0, B=255, increase red from 0 to 255
//case 4: R=255, B=255, increase green from 0 to 255
//case 5: R=255, B=0, increase green from 0 to 255
//case 6: R=255, G=255, increase blue from 0 to 255
///////////////////////////////////////////////////////////////////////////////

Fractal.prototype.rgbNum = function (escapeTime) {
    if (escapeTime <= 2) {
        return [0, 0, 0];
    } else if (escapeTime === this.maxEscapeTime) {
        return [0, 25, 0];
    }

    var redNum;
    var greenNum;
    var blueNum;
    var rgbIncrements = Math.floor(this.maxEscapeTime / 7);
    var caseNum = Math.floor(escapeTime / rgbIncrements);
    var remainNum = escapeTime % rgbIncrements;

    return [
        colors[caseNum]["red"],
        colors[caseNum]["green"],
        colors[caseNum]["blue"],
    ];
};

// Waiting to receive the OffScreenCanvas
self.onmessage = function (e) {
    //Initiate the canvas and start the counting
    canvas = e.data.canvas;
    cardTitle = e.data.cardTitle;
    context = canvas.getContext("2d");

    generateFractal();
};

function generateFractal() {
    const fractal = new Fractal(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);

    const cords = COORDS[Math.floor(Math.random() * COORDS.length)];

    cords["xCartMin"] = randomFloatBetween(
        cords["xCartMin"],
        cords["xCartMax"] / 2
    );

    cords["xCartMax"] = randomFloatBetween(
        cords["xCartMin"] / 2,
        cords["xCartMax"]
    );

    cords["yCartMin"] = randomFloatBetween(
        cords["yCartMin"],
        cords["yCartMax"] / 2
    );

    cords["yCartMax"] = randomFloatBetween(
        cords["yCartMin"] / 2,
        cords["yCartMax"]
    );

    const params = {
        pxWidth: canvasWidth,
        pxHeight: canvasWidth,
        cords: COORDS[randomBetween(0, COORDS.length)],
        maxEscapeTime: randomBetween(1000, 1700),
    };

    fractal.update(params);

    drawContent();
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function getRandomFont() {
    return FONTS[Math.floor(Math.random() * FONTS.length)];
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function drawContent() {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvasWidth, 60);

    const randFill = colors[Math.floor(Math.random() * 6)];
    context.fillStyle = rgbToHex(
        randFill["red"],
        randFill["green"],
        randFill["blue"]
    );
    var randomFont = getRandomFont();
    context.font = `30pt ${randomFont}`;

    sleep(500).then(() => {
        context.fillText("", 15, 42.5);
        sleep(500).then(() => {
            context.font = `30pt ${randomFont}`;
            context.fillText("AlgoFractals NFT", 15, 42.5);
        });
    });

    sleep(500).then(() => {
        context.fillText("", 0, 42.5);
        sleep(500).then(() => {
            var textString = "#" + cardTitle;
            context.font = `30pt ${randomFont}`;
            var textWidth = context.measureText(textString).width;
            context.fillText(textString, canvasWidth - textWidth - 15, 42.5);
        });
    });
}

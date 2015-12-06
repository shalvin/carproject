function renderThingCompass(canvas) {
    var ctx = canvas.getContext('2d');

    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    var lineColour = '#80AEFF';
    var glowColour = 'white';

    var radius = centerX < centerY ? centerX + 50 : centerY + 50;

    var minTilt = 0.33;

    if (motionData.compassHeading)
        var heading = motionData.gyroCompass * Math.PI / 180;
    else
        var heading = 0;


    // *** Transform ***
    var rotation = heading;
    var tilt = motionData.tiltFB * Math.PI / 180;
    var cs = Math.cos(rotation), sn = Math.sin(rotation);
    var h = Math.cos(tilt) > minTilt ? Math.cos(tilt) : minTilt;
    var a = cs, b = -sn, c = centerX;
    var d = h * sn, e = h * cs, f = centerY + centerY/2;
    
    ctx.save();
    ctx.setTransform(a, d, b, e, c, f);
    ctx.save();


    // *** Ellipse ticks****
    var nTicks = 128;
    var tickAngle = 2 * Math.PI / nTicks;

    ctx.save();
    ctx.lineCap = 'hard';
    ctx.beginPath();
    ctx.setLineDash([4, 10]);
    ctx.lineWidth = 10;
    ctx.strokeStyle = lineColour;
    ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.lineWidth = 5;
    for (var i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.moveTo(0, radius - 15);
        ctx.lineTo(0, radius);
    }
    ctx.stroke();
    ctx.restore();

    
    // *** Crosshair ***
    var crosshairSize = 5;

    ctx.save();
    ctx.moveTo(0, -crosshairSize);
    ctx.lineTo(0, crosshairSize);
    ctx.moveTo(-crosshairSize, 0);
    ctx.lineTo(crosshairSize, 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = lineColour;
    //ctx.shadowColor = glowColour;
    //ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.restore();


    // *** North, East, South, West labels ****
    var NESWLabels = ['N', 'E', 'S', 'W'];
    var labelOffset = radius + 10;
    
    ctx.font = '22pt Calibri'
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dbe8ff';

    ctx.save();
    ctx.fillText(NESWLabels[0], 0, -labelOffset); // North
    ctx.rotate(Math.PI / 2);
    ctx.fillText(NESWLabels[1], 0, -labelOffset); // East
    ctx.rotate(Math.PI);
    ctx.fillText(NESWLabels[3], 0, -labelOffset);  // West
    ctx.rotate(3 * Math.PI / 2);
    ctx.fillText(NESWLabels[2], 0, -labelOffset); // South
    ctx.restore();

    ctx.restore();


    // *** Top marker *** 
    ctx.save();
    var rotation = 0;
    var cs = Math.cos(rotation), sn = Math.sin(rotation);
    var a = cs, b = -sn;
    var d = h * sn, e = h * cs;
    ctx.setTransform(a, d, b, e, c, f);

    var markerSize = 10;

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'red';
    //ctx.shadowColor = 'red';
    //ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, -radius - markerSize / 2);
    ctx.lineTo(0, -radius + markerSize / 2);
    ctx.stroke();
    ctx.restore();


    // *** Ball *** 
    var maxG = 4;

    ctx.save();
    var ballSize = 5;
    var ballX = (motionData.xRaw) / (maxG * 9.81) * radius;
    var ballY = -(motionData.yRaw) / (maxG * 9.81) * radius;

    ctx.beginPath();
    ctx.fillStyle = lineColour;
    ctx.arc(ballX, ballY, ballSize, 0, 2 * Math.PI, false);
    ctx.fill();

    var xMax = (motionData.xRecentMax) / (maxG * 9.81) * radius;
    var yMax = -(motionData.yRecentMax) / (maxG * 9.81) * radius;

    if (xMax !== 0 && yMax !== 0 && (motionData.xRecentMax > 4 || motionData.yRecentMax > 4)) {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        //ctx.shadowColor = 'white';
        //ctx.shadowBlur = 15;
        ctx.arc(xMax, yMax, ballSize, 0, 2 * Math.PI, false);
        ctx.fill();
    }

    ctx.restore();

    var nRings = 4;
    
    for (var i = 1; i < nRings; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, radius / nRings * i, 0, 2 * Math.PI, false);
        ctx.lineWidth = 1;
        ctx.setLineDash([5,15]);
        ctx.strokeStyle = 'rgba(128, 174, 255, 0.5)';
        ctx.stroke();
    }

    ctx.restore();
}

/////////////////////////////////////////////////////////////////////

function gradientFromList(ctx, x1, y1, x2, y2, colorList) {
    if (colorList.length < 1)
        return;

    var gradient = ctx.createLinearGradient(x1, y1, x2, y2);

    gradient.addColorStop(0, colorList[0]);
    for (var i = 1; i < colorList.length; i++) {
        gradient.addColorStop((i + 1) / colorList.length, colorList[i]);
    }
    return gradient;
}

/////////////////////////////////////////////////////////////////////

function drawGMeter(ctx, percentFullA, percentFullB, x, y, width, height, tickLineDash, backgroundGradient, barGradientA, barGradientB) {
    // background
    //ctx.fillStyle = gradientFromList(ctx, 0, y, 0, y + height, ['#2F2F2F', '#000']);
    //ctx.fillRect(x - width / 2, y, width, height);
    ctx.fillStyle = gradientFromList(ctx, 0, y, 0, y + height, ['#2F2F2F', '#000']);
    ctx.fillRect(x - width / 2, y, width, height);

    // secondary bar
    ctx.fillStyle = gradientFromList(ctx, 0, y, 0, y + height, ['#700000']);
    ctx.fillRect(x,  y + 3, percentFullB * width / 2, height - 6);

    // primary bar
    ctx.fillStyle = gradientFromList(ctx, 0, y, 0, y + height, ['#aec7cc']);
    ctx.fillRect(x,  y + 3, percentFullA * width / 2, height - 6);

    // ticks
    ctx.save();
    ctx.setLineDash(tickLineDash);
    ctx.lineWidth = height;
    ctx.strokeStyle = '#f5f5f5';
    ctx.beginPath();

    ctx.moveTo(x            , y + height / 2);
    ctx.lineTo(x + width / 2, y + height / 2);

    ctx.moveTo(x            , y + height / 2);
    ctx.lineTo(x - width / 2, y + height / 2);

    ctx.stroke();
    ctx.restore();
}

/////////////////////////////////////////////////////////////////////

function clearCanvas(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/////////////////////////////////////////////////////////////////////

function resetCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/////////////////////////////////////////////////////////////////////

function renderFrame(ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;

    clearCanvas(ctx);

    // -- Draw horizontal 'G' meter --
    drawGMeter(
        ctx,
        motionState.xRaw / 9.81 / gMeterProperties.maxReading,
        motionState.xRecentMax / 9.81 / gMeterProperties.maxReading,
        w / 2,
        h - 35,
        gMeterProperties.width,
        gMeterProperties.height,
        [1, (gMeterProperties.width / 2 / gMeterProperties.maxReading) - 1]
    );

    previousMotionState = motionDataClone(motionState);

    window.requestAnimationFrame(function () {
        renderFrame(ctx);
    });
}

/////////////////////////////////////////////////////////////////////

var canvasContext;
var motionState = MotionData;
var previousMotionState = motionState;

var gMeterProperties;

function initDashboard() {
    var canvas = document.getElementById('compass');
    var canvasContext = canvas.getContext('2d');

    gMeterProperties = {
        width: 400,
        height: 20,
        maxReading: 2.1
    };

    motionStartListeners(motionState);

    resetCanvas(canvas);
    window.addEventListener('resize', function() {
        resetCanvas(canvas);
    });

    window.requestAnimationFrame(function () {
        renderFrame(canvasContext);
    });
}

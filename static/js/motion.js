var motionData = {
    dir: 0,
    tiltFB: 0,
    tiltLR: 0,

    x: 0,
    y: 0,
    z: 0,

    xRecentMax: 0,
    yRecentMax: 0,
    zRecentMax: 0,
    
    xRaw: 0,
    yRaw: 0,
    zRaw: 0,

    compassHeading: null,
    compassAccuracy: 0,
    
    gyroCompass: 0,
    degreesFromNorth: 0,
    updateInterval: 5000,

    timeoutID: null,

    orientation: 'portrait',

    updateGyroCompass: function() {
        var hdg = motionData.compassHeading;
        var dir = motionData.dir;
        motionData.degreesFromNorth = ((dir - hdg + 180) % 360) - 180;
        setTimeout(motionData.updateGyroCompass, motionData.updateInterval);
    },
       
    addListeners: function () {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', function (eventData) {
                if (window.innerWidth > window.innerHeight) {
                    motionData.tiltLR = filter(motionData.tiltLR, eventData.beta);
                    motionData.tiltFB = filter(motionData.tiltFB, eventData.gamma);
                } else {
                    motionData.tiltFB = filter(motionData.tiltLR, eventData.beta);
                    motionData.tiltLR = filter(motionData.tiltFB, eventData.gamma);
                }

                motionData.dir = filter(motionData.dir, event.alpha);

                if (eventData.webkitCompassHeading) {
                    motionData.compassHeading = eventData.webkitCompassHeading;
                    motionData.compassAccuracy = eventData.webkitCompassAccuracy;
                    motionData.updateGyroCompass();
                    motionData.gyroCompass = -((motionData.dir - motionData.degreesFromNorth ) % 360);
                }
            });
        }

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', function (eventData) {
                if (window.innerWidth > window.innerHeight) {
                    motionData.yRaw = filter(motionData.xRaw, eventData.acceleration.x);
                    motionData.zRaw = filter(motionData.yRaw, eventData.acceleration.z);
                    motionData.xRaw = filter(motionData.zRaw, eventData.acceleration.y);
                } else {
                    motionData.xRaw = filter(motionData.xRaw, eventData.acceleration.x);
                    motionData.zRaw = filter(motionData.yRaw, eventData.acceleration.z);
                    motionData.yRaw = filter(motionData.zRaw, eventData.acceleration.y);
                }

                motionData.x = filter(motionData.x, eventData.accelerationIncludingGravity.x);
                motionData.y = filter(motionData.y, eventData.accelerationIncludingGravity.z);
                motionData.z = filter(motionData.z, eventData.accelerationIncludingGravity.y);

                if (!motionData.timeoutID) {
                    motionData.timeoutID = setTimeout(function () {
                        motionData.xRecentMax = 0;
                        motionData.yRecentMax = 0;
                        motionData.zRecentMax = 0;
                    }, 2000);
                }
                if (Math.abs(motionData.xRaw) > Math.abs(motionData.xRecentMax)) {
                    motionData.xRecentMax = motionData.xRaw;
                    if (motionData.timeoutID) {
                        clearTimeout(motionData.timeoutID);
                        motionData.timeoutID = null;
                    }
                }
                if (Math.abs(motionData.yRaw) > Math.abs(motionData.yRecentMax)) {
                    motionData.yRecentMax = motionData.yRaw;
                    if (motionData.timeoutID) {
                        clearTimeout(motionData.timeoutID);
                        motionData.timeoutID = null;
                    }
                }
                if (Math.abs(motionData.zRaw) > Math.abs(motionData.zRecentMax)) {
                    motionData.zRecentMax = motionData.zRaw;
                    if (motionData.timeoutID) {
                        clearTimeout(motionData.timeoutID);
                        motionData.timeoutID = null;
                    }
                }

                motionData.motionInterval = eventData.interval;
                motionData.rotationRate = eventData.rotationRate;
            });
        }
    }
};

function filter(oldVar, newVar) {
    var delta = Math.abs(oldVar - newVar);
    if (delta > 0.0) {
        return newVar;
    }
    return oldVar;
}

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

function clear(canvas) {
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function motionInit() {
    motionData.addListeners();

    var canvas = document.getElementById('compass');

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    window.addEventListener('resize', resetCanvas);

    window.requestAnimationFrame(renderFrame);
}

function resetCanvas() {
    var canvas = document.getElementById('compass');

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
}

function renderFrame() {
    var canvas = document.getElementById('compass');

    clear(canvas);

    renderThingCompass(canvas);

    window.requestAnimationFrame(renderFrame);
}

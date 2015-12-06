var MotionData = {
    // Gyroscope values
    dir: 0,
    tiltFB: 0,
    tiltLR: 0,

    // Acceleromter values including gravity
    x: 0,
    y: 0,
    z: 0,

    // Acceleromter values excluding gravity
    xRaw: 0,
    yRaw: 0,
    zRaw: 0,

    // Compass values
    compassHeading: null,
    compassAccuracy: 0,

    xRecentMax: 0,
    yRecentMax: 0,
    zRecentMax: 0,

    // Gyroscope assisted compass
    gyroCompass: 0,
    degreesFromNorth: 0,
    headingUpdateInterval: 5000,

    timeoutID: null,

    orientation: 'portrait'
};

function motionDataClone(motionData) {
    return $.extend({}, motionData);
}

function motionUpdateGyroCompass(motionData) {
    var hdg = motionData.compassHeading;
    var dir = motionData.dir;
    motionData.degreesFromNorth = ((dir - hdg + 180) % 360) - 180;
    setTimeout(function () {
            updateGyroCompass(motionData);
        }, motionData.headingUpdateInterval);
};
       
function motionStartListeners(motionData) {
    function filter(oldVar, newVar) {
        var delta = Math.abs(oldVar - newVar);
        if (delta > 0.0) {
            return newVar;
        }
        return oldVar;
    }

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
                motionData.updateGyroCompass(motionData);
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


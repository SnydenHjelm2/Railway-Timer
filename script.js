const req = {
    send: async (path, method, body = null) => {
        let reqObj = {
            method: method,
            headers: {"content-type": "application/json"}
        }
        if (body) reqObj.body = JSON.stringify(body);
        let resp = await fetch(`https://railway-timer-production.up.railway.app/${path}`, reqObj);
        return resp.json();
    }
}

const timer = {
    convert: (ms) => {
        const seconds = Math.floor(ms / 1000) % 60;
        const minutes = Math.floor(ms / (1000 * 60)) % 60;
        const hours = Math.floor(ms / (1000 * 60 * 60));

        if (seconds < 10 && minutes < 10) {
            timer.h1.textContent = `0${hours}:0${minutes}:0${seconds}`;
            document.title = `0${hours}:0${minutes}:0${seconds} left...`;
        } else if (minutes < 10) {
            timer.h1.textContent = `0${hours}:0${minutes}:${seconds}`;
            document.title = `0${hours}:0${minutes}:${seconds} left...`;
        } else if (seconds < 10) {
            timer.h1.textContent = `0${hours}:${minutes}:0${seconds}`;
            document.title = `0${hours}:${minutes}:0${seconds} left...`;
        } else {
            timer.h1.textContent = `0${hours}:${minutes}:${seconds}`;
            document.title = `0${hours}:${minutes}:${seconds} left...`;
        }
    },

    elapsed: () => {
        return Date.now() - timer.startTime;
    },

    h1: document.querySelector("h1"),

    initiate: async () => {
        let started = await req.send("started", "GET");
        let startTime = await req.send("time", "GET");
        if (!started) {
            if (!startTime) {
                timer.convert(9000000);
                return;
            } else {
                let stopTime = await req.send("stopTime", "GET");
                stopTime = parseInt(stopTime);
                startTime = parseInt(startTime);

                if (9000000 - (stopTime - startTime) <= 0) {
                    timer.p.innerHTML = "Tiden är inne. Det ska bli vi igen...<br>Ni lyckades inte stoppa August i tid.<br>Tack för att ni spelade!";
                    timer.convert(0);
                    return;
                } else {
                    timer.p.innerHTML = "Bra jobbat! Ni lyckades stoppa August!<br>Tack för att ni spelade!";
                }

                timer.convert(9000000 - (stopTime - startTime));
                return;
            }
        }
        timer.startTime = parseInt(startTime);
        timer.update();
        timer.interval = setInterval(timer.update, 1000);
        timer.p.textContent = "Klockan tickar...";
        return;
    },

    interval: null,

    p: document.querySelector("p"),

    reset: async () => {
        let reso = await req.send("hard-reset", "DELETE", {time: ""});
        timer.convert(9000000);
        return reso;
    },

    start: async () => {
        let reso = await req.send("start", "POST");
        if (reso.error) return "Timer already started!";
        await timer.initiate();
        return "Timer started!";
    },

    startTime: null,

    stop: async (type) => {
        clearInterval(timer.interval);
        let reso = await req.send("reset", "DELETE");
        if (type === "finished") {
            timer.h1.textContent = "00:00:00";
            timer.p.innerHTML = "Tiden är inne, det ska bli vi igen...<br>Tack för att ni spelade!";
            return;
        }
        document.querySelector("p").textContent = "...";
        return "Timer stopped!";
    },

    update: async () => {
        if (!timer.startTime) return "Timer not started!";

        let elapsed = timer.elapsed();
        let timeLeft = 9000000 - elapsed;
        if (timeLeft <= 0) {
            await timer.stop("finished");
            return;
        }

        timer.convert(timeLeft);
    }
}
timer.initiate();
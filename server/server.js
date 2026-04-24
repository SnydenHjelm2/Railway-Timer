const createResp = (data, headers, status = 200) => {
    return new Response(JSON.stringify(data), {status: status, headers: headers});
}

const handler = async (req) => {
    const headersOBJ = new Headers();
    headersOBJ.set("Access-Control-Allow-Origin", "*");
    headersOBJ.set("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
    headersOBJ.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        return createResp(null, headersOBJ, 200);
    }

    const url = new URL(req.url);

    switch (req.method) {
        case "GET": {
            headersOBJ.set("Content-Type", "application/json");
            if (url.pathname === "/time") {
                let db = JSON.parse(Deno.readTextFileSync("../db/timer.json"));
                if (!db.started) return createResp({error: "Timer not started"}, headersOBJ, 400);

                return createResp(db.startTime, headersOBJ, 200);
            } else if (url.pathname === "/started") {
                let db = JSON.parse(Deno.readTextFileSync("../db/timer.json"));
                return createResp(db.started, headersOBJ, 200);
            }
        }

        case "POST": {
            headersOBJ.set("Content-Type", "application/json");
            if (url.pathname === "/start") {
                let db = JSON.parse(Deno.readTextFileSync("../db/timer.json"));
                if (db.started) return createResp({error: "Timer already started"}, headersOBJ, 400);

                if (req.headers.get("content-type") !== "application/json") return createResp({error: "Invalid content-type"}, headersOBJ, 400);
                let reqBody = await req.json();
                if (!reqBody.time) return createResp({error: "Missing attributes"}, headersOBJ, 400);
                db.started = true;
                db.startTime = reqBody.time;

                Deno.writeTextFileSync("../db/timer.json", JSON.stringify(db));
                return createResp({success: "Timer started!"}, headersOBJ, 200);
            }
        }

        case "DELETE": {
            headersOBJ.set("Content-Type", "application/json");
            if (url.pathname === "/reset") {
                let db = JSON.parse(Deno.readTextFileSync("../db/timer.json"));
                if (!db.started) return createResp({error: "Timer not started"}, headersOBJ, 400);

                db.started = false;
                db.startTime = "";
                Deno.writeTextFileSync("../db/timer.json", JSON.stringify(db));
                return createResp({success: "Timer reset"}, headersOBJ, 200);
            }
        }
    }

    return createResp({error: "Bad Request"}, headersOBJ, 400);
}

Deno.serve(handler);
import { createWebSocketServer, send, subscribe } from './ws-wrapper';
import * as minimist from 'minimist';
import { performStream } from "@funkia/hareactive";
import { mapMap } from "@funkia/jabz";

const argv = minimist(process.argv.slice(2));
const port = argv.port || 3000;
const newSockets = createWebSocketServer({port, path: "/api"});

const newSocketData = newSockets.map(client => subscribe(client).log().map((m) => send(client, m)));

newSocketData.subscribe(client => performStream(client).run());

console.log("Server booted")


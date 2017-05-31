import { createWebSocketServer, send, subscribe } from './ws-wrapper';
import { loopSocket } from "./websocket";
import * as minimist from 'minimist';
import { performStream, loopNow, Now, Behavior } from "@funkia/hareactive";
import { mapMap } from "@funkia/jabz";

const argv = minimist(process.argv.slice(2));
const port = argv.port || 3000;
const newSockets = createWebSocketServer({port, path: "/api"});

newSockets.subscribe(socket => {
  console.log('Connected')
  loopNow(({name}: any) => {
    const NAME = name.map((str: string) => str.toUpperCase()).log();
    return Now.of(loopSocket({name: NAME}, socket, ["name"]));
  }).run();

});

console.log("Server booted")




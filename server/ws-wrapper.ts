import { producerStream, Stream } from "@funkia/hareactive";
import { Server, IServerOptions } from "ws";
import { withEffects } from "@funkia/jabz";


export function createWebSocketServer(options: IServerOptions): Stream<WebSocket> {
  const wss = new Server(options);
  return producerStream<WebSocket>(push => {
    const handler = (client: WebSocket) => push(client);
    wss.on("connection", <any>handler);
    return () => wss.removeListener("connection", handler); 
  });
}

export const subscribe = (socket: WebSocket) => producerStream<string>(push => {
  socket.onmessage = ({data}: any) => (<any>push(data));
  return () => socket.onmessage = () => {};
});

export const send = withEffects((socket: WebSocket, message: string) => {
  socket.send(message);
});


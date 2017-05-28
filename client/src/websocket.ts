import { Stream, producerStream } from "@funkia/hareactive";
import { withEffects } from "@funkia/jabz";

export const subscribe = (socket: WebSocket) => producerStream<string>(push => {
  socket.onmessage = ({data}) => push(data);
  return () => socket.onmessage = () => {};
});

export const send = withEffects((socket: WebSocket, message: string) => {
  socket.send(message);
});


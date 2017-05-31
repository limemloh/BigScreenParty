import { Stream, producerStream, Reactive, 
  Behavior, producerBehavior, performStream, 
  changes, Now, isBehavior, isStream, placeholder, sinkBehavior, sinkStream} from "@funkia/hareactive";
import { withEffects } from "@funkia/jabz";

export const subscribe = (socket: WebSocket) => producerStream<string>(push => {
  socket.onmessage = ({data}) => push(data);
  return () => socket.onmessage = () => {};
});

export const send = withEffects((socket: WebSocket, message: string) => {
  socket.send(message);
});

export type Reactives = Record<string, Reactive<string>>

export class LoopSocket<A extends Reactives> extends Now<A> {
  constructor(private reactives: Reactives, private socket: WebSocket, private names?: string[]) {
    super();
  }
  run(): A {
    for(const name of Object.keys(this.reactives)) {
      const reactive = this.reactives[name];
      reactive.subscribe(value => this.socket.send(JSON.stringify({
        type: isBehavior(reactive) ? "Behavior" : "Stream", 
        name, 
        value
      })));
    }

    const created: any = {};
    const p = this.names === undefined ? new Proxy({}, {
      get: function (target: any, name: string) {
        if (name in created) {
          return created[name];
        }
        if (!(name in target)) {
          target[name] = placeholder();
        }
        return target[name];
      }
    }) : this.names.reduce((obj: any, name: string) => {
      obj[name] = placeholder();
      return obj;
    }, {});
    
    this.socket.onmessage = ({data}) => {
      const {name, type, value} = JSON.parse(data);
      if (!(name in created)) {
        const replacement = type === "Behavior" ? sinkBehavior("") : sinkStream();
        if (name in p) {
          p[name].replaceWith(replacement);
        }
        created[name] = replacement;
      }
      created[name].push(value);
    }
    return p;
  }
}

export function loopSocket(reactives: Reactives, socket: WebSocket, names?: string[]): Now<Reactives> {
  return new LoopSocket(reactives, socket, names);
}
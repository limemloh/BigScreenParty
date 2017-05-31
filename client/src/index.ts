import { runComponent, modelView, elements } from "@funkia/turbine";
import { stepper, Stream, performStream, time, snapshot, sample, Behavior, Now} from "@funkia/hareactive";
import { fgo, go, lift } from '@funkia/jabz';
import { loopSocket } from "./hareactive-websocket";
const { div, h1, span, button, br, input } = elements;

const wsUrl = "ws://localhost:8080/api";
const socket = new WebSocket(wsUrl);
console.log(socket);
socket.onclose = (a) => console.log(a);


type Timer = {
  start: Stream<any>,
  stop: Stream<any>
}

const timerModel = fgo(function* ({start, stop}) {
  const now = yield sample(time);
  const sendTime: Behavior<number> = yield sample(stepper(now, snapshot(time, start)));
  const receivedTime: Behavior<number> = yield sample(stepper(now, snapshot(time, stop)));
  const timed = lift((b, a) => Math.max(a - b, 0), sendTime, receivedTime);
  return {timed};
});

type Model = {
  value: Behavior<string>,
  sendClick: Stream<any>
}

function model({sendClick, value}: Model): Now<any> {
  return loopSocket({name: value.log(), click: sendClick}, socket).chain(({name, click}) => Now.of({lastMessage: name}));
}

type View = {
  lastMessage: Behavior<string>
};

const view = ({lastMessage}: View) => div([
  h1("Socket Test"),
  input({output: {value: "inputValue"}}),
  span(["Received: ", lastMessage]),
  br,
  button({ output: { sendClick: "click" } }, "send")
]);

const app = modelView<Model, View, {}>(model, view)();

socket.onopen = () => runComponent("#mount", app);

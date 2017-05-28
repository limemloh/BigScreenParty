import { Behavior } from '@funkia/hareactive/dist/defs';
import { runComponent, modelView, elements } from "@funkia/turbine";
import { stepper, Stream, performStream, time, snapshot, sample } from "@funkia/hareactive";
import { fgo, go, lift } from '@funkia/jabz';
import { send, subscribe } from "./websocket";
const { div, h1, span, button, br } = elements;

const wsUrl = "ws://localhost:8080/api";
const socket = new WebSocket(wsUrl);
socket.onclose = (a) => console.log(a);

type Model = {
  sendClick: Stream<any>
}

type Timer = {
  start: Stream<any>,
  stop: Stream<any>
}

const timerModel = fgo(function* ({start, stop}) {
  const now = yield sample(time);
  const sendTime = stepper(now, snapshot(time, start));
  const received = subscribe(socket);
  const receivedTime = stepper(now, snapshot(time, stop));
  const timed = lift((b, a) => Math.max(a - b, 0), sendTime, receivedTime);
  return {timed};
});

const model = fgo(function* model({sendClick}) {
  const sendMessages = sendClick.mapTo(send(socket, JSON.stringify({value: "click"})));
  const received = subscribe(socket);

  const {timed: latency} = yield timerModel({start: sendClick, stop: received})
  
  const lastMessage = stepper("Nothing received yet ", received);

  yield performStream(sendMessages);
  return {lastMessage, latency};
});

type View = {
  lastMessage: Behavior<string>,
  latency: Behavior<string>
};

const view = ({lastMessage, latency}: View) => div([
  h1("Socket Test"),
  span(["Received: ", lastMessage, " ", latency, " ms"]),
  br,
  button({ output: { sendClick: "click" } }, "send")
]);

const app = modelView(model, view)();

runComponent("#mount", app);

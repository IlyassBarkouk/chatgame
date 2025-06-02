// src/@types/simple-peer.d.ts

declare module "simple-peer" {
  import { EventEmitter } from "events";

  export interface SignalData {
    [key: string]: any;
  }

  export interface Options {
    initiator?: boolean;
    trickle?: boolean;
    stream?: MediaStream;
    config?: RTCConfiguration;
  }

  class SimplePeer extends EventEmitter {
    constructor(opts?: Options);
    signal(data: SignalData): void;
    send(data: any): void;
    destroy(): void;
  }

  export default SimplePeer;
}

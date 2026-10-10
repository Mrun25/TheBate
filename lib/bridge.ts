import EventEmitter from 'eventemitter3';
export const bridge = new EventEmitter();
export type Room = 'lobby'|'arena'|'thinkalong'|'live'|'trophy'|'community';

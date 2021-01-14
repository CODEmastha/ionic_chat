import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { ItemProperties } from './ItemProperties';

const itemUrl = `http://${baseUrl}/messages/`;

export const getItems: (token: string) => Promise<ItemProperties[]> = token => {
    const etag = window.localStorage.getItem('etag_key');
    if (!etag){
        return withLogs(axios.get( itemUrl, authConfig(token)).then( res => {
            window.localStorage.setItem('etag_key', res.headers['etag']);
            console.log(res.headers['etag'])
            return res;
        }), 'getMessages without etag');
    }
    else{
        return withLogs(axios.get( itemUrl, authConfig(token)).then( res => {
            if(res.status !== 304)
                window.localStorage.setItem('etag_key', res.headers['etag']);
            console.log(res.headers['etag'])
            return res;
        }), 'getMessages with etag');
    }
}

export const createItem: (token: string, item: ItemProperties) => Promise<ItemProperties[]> = (token, item) => {
    return withLogs(axios.post(itemUrl, item, authConfig(token)), 'createItem');
}

export const updateItem: (token: string, item: ItemProperties) => Promise<ItemProperties[]> = (token, item) => {
    return withLogs(axios.put(`${itemUrl}/${item.id}`, item, authConfig(token)), 'updateItem');
}

interface MessageData {
    type: string;
    payload: ItemProperties;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}

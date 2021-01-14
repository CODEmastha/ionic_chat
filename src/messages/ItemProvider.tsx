import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import {authConfig, getLogger} from '../core';
import { ItemProperties } from './ItemProperties';
import { createItem, getItems, newWebSocket, updateItem } from './ItemApi';
import { AuthContext } from '../login'
import {Network, NetworkStatus} from "@capacitor/core";
import {AuthProvider} from "../login";

const log = getLogger('ItemProvider');

type SaveItemFn = (item: ItemProperties) => Promise<any>;

export interface ItemsState {
    items?: ItemProperties[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveItem?: SaveItemFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    fetching: false,
    saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                return { ...state, items: payload.items, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ITEM_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ITEM_SUCCEEDED:
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(it => it.id === item._id);
                if (index === -1) {
                    items.splice(0, 0, item);
                } else {
                    items[index] = item;
                }
                return { ...state, items, saving: false };
            case SAVE_ITEM_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { items, fetching, fetchingError, saving, savingError } = state;
    useEffect(getItemsEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);
    const value = { items, fetching, fetchingError, saving, savingError, saveItem };
    const [networkState, setNetworkState] = useState(true);
    const { username } = useContext(AuthContext);
    log('returns');
    useEffect(()=> {        const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange);
        Network.getStatus().then(handleNetworkStatusChange);
        let canceled = false;
        return () => {
            canceled = true;
            handler.remove();
        }

        function handleNetworkStatusChange(status: NetworkStatus) {
            if (!canceled) {
                setNetworkState(status.connected);
                if(status.connected){
                    window.localStorage.setItem('connection', 'true');
                    const arr = JSON.parse(window.localStorage.getItem("unsavedItems")||"[]");
                    arr.forEach((item: ItemProperties) => {
                        saveItem && saveItem(item);
                    });
                    window.localStorage.removeItem("unsavedItems");
                }else{
                    window.localStorage.setItem('connection', 'false');
                }
            }
        }}, [saveItem]);
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
        }

        async function fetchItems() {
            if (!token?.trim()) {
                return;
            }
            try {
                if(networkState) {
                    log('fetchItems started');
                    dispatch({type: FETCH_ITEMS_STARTED});
                    const items = await getItems(token);
                    window.localStorage.setItem("items", JSON.stringify(items));
                    log('fetchItems succeeded');
                    if (!canceled) {
                        dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items}});
                    }
                }else{
                    log('fetchItems failed');
                    const items = JSON.parse(window.localStorage.getItem("items")||"[]");
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
                }
            } catch (error) {
                log('fetchItems failed');
                const items = JSON.parse(window.localStorage.getItem("items")||"[]");
                dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items } });
            }
        }
    }

    async function saveItemCallback(item: ItemProperties) {
        try {
            if(window.localStorage.getItem('connection') === "true") {
                log('saveItem started');
                dispatch({type: SAVE_ITEM_STARTED});
                const savedItem = await (item.id ? updateItem(token, item) : createItem(token, item));
                log('SAVE ONLINE');
                dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: savedItem}});
            }else{
                const arr = JSON.parse(window.localStorage.getItem("unsavedItems")||"[]");
                item.username = window.localStorage.getItem('username')||'';
                console.log(item);
                arr.push(item);
                log('SAVE OFFLINE');
                window.localStorage.setItem("unsavedItems", JSON.stringify(arr));
            }
        } catch (error) {
            log('save err');
            const arr = JSON.parse(window.localStorage.getItem("unsavedItems")||"[]");
            item.username = window.localStorage.getItem('username')||'';
            console.log('username in prov' + item.username);
            arr.push(item);
            console.log(item);
            window.localStorage.setItem("unsavedItems", JSON.stringify(arr));
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const { type, payload: item } = message;
                log(`ws message, item ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};

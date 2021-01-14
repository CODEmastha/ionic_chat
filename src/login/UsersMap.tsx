import React, {useContext, useEffect, useRef, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {IonPage, IonHeader, IonToolbar, IonItem, IonIcon, IonButton, IonTitle, IonContent} from "@ionic/react";

import {Popup, MapContainer, TileLayer, Marker, Tooltip, useMap} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import {getOnMapUsers, getUsers, UserProps} from "./api";
import {AuthContext} from "./provider";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
})
L.Marker.prototype.options.icon = DefaultIcon;

export const MapUsers: React.FC<RouteComponentProps> = ({ history }) => {
    const [users, setUsers] = useState<UserProps[]>([]);
    const [x, setX] = useState('');
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const {username} = useContext(AuthContext);

    useEffect(()=> {
        getOnMapUsers(window.localStorage.getItem("token")||'').then(r=> {setUsers(r);});
        console.log(users);
        console.log("coords"+latitude+" "+ longitude);
    }, [x])

    function getMyCoords() {
        if( users !== undefined && users !== []){
            console.log("lista users", users);
            users.forEach((u)=> {
                if (u.username === username) {
                setLatitude(u.latitude);
                setLongitude(u.longitude);
            }});
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle><b>Users map</b></IonTitle>
                    <IonButton onClick={()=>history.push("/items")}>Back</IonButton>
                </IonToolbar>
            </IonHeader>
            <MapContainer zoom={2} center={[latitude, longitude]} style={{height: 1000, width: 2000}} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {users && users.map(({latitude,longitude,username}) =>
                {return (<Marker position= {[latitude, longitude]}>
                    <Tooltip>{username}</Tooltip> </Marker>)
                    }
                )}
            </MapContainer>
        </IonPage>
    );
}
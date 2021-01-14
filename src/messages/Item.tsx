import React from 'react';
import {IonImg, IonIcon, IonItem, IonLabel} from '@ionic/react';
import { ItemProperties } from './ItemProperties';
import { personCircle } from 'ionicons/icons';
import { createOutline } from 'ionicons/icons';
import { usePhotoGallery} from "./usePhotoGallery";
import "./CSSmessages.css";

interface ItemPropsExt extends ItemProperties {
    onEdit: (_id?: string, username?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({ id, text, username,photo, onEdit }) => {
    const {getPhotoByFilename} = usePhotoGallery();

    return (
        <IonItem>
            <div>
            <IonIcon id="userIcon" icon = {personCircle}/>
            <IonLabel id="username">{username}</IonLabel>
            </div>
            <br/>
            <br/>
            <IonLabel class="messageText">{text}</IonLabel>
            <IonImg src={getPhotoByFilename(photo||'')} style={{height: '100px', width: '100px'}}/>
        </IonItem>
    );
};

export default Item;

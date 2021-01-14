import React from 'react';
import {IonIcon, IonImg, IonItem, IonLabel} from '@ionic/react';
import { ItemProperties } from './ItemProperties';
import { personCircle } from 'ionicons/icons';
import { createOutline } from 'ionicons/icons';
import { warningOutline } from "ionicons/icons";
import "./CSSmessages.css";
import {usePhotoGallery} from "./usePhotoGallery";

interface ItemPropsExt extends ItemProperties {
    onEdit: (_id?: string, username?: string) => void;
}

const UnsavedItem: React.FC<ItemPropsExt> = ({ id, text, username,photo, onEdit }) => {
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
            <IonIcon slot={"end"} icon={warningOutline}/>
            <IonImg src={getPhotoByFilename(photo||'')} style={{height: '100px', width: '100px'}}/>
        </IonItem>
    );
};

export default UnsavedItem;

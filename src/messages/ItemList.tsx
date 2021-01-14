import React, {useContext, useEffect, useRef, useState} from 'react';
import { RouteComponentProps } from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonTextarea,
    IonFooter,
    IonButton,
    IonLabel,
    IonCard,
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonImg,
    IonItem,
    IonGrid,
    IonCol,
    IonRow,
    createAnimation
} from '@ionic/react';
import { usePhotoGallery } from './usePhotoGallery'
import {camera, chatbox, infinite} from 'ionicons/icons';
import Item from './Item';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import {ItemProperties} from "./ItemProperties";
import {AuthState, AuthContext} from "../login";
import "./NetworkStatus";
import {useNetwork} from "./NetworkStatus";
import UnsavedItem from "./UnsavedItem";
const log = getLogger('ItemList');

interface ItemAddProps extends RouteComponentProps<{
    id?: string;
}> {}

const ItemList: React.FC<RouteComponentProps> = ({ history }) => {
    const { takePhoto, getPhotoByFilename } = usePhotoGallery();
    const { saveItem } = useContext(ItemContext);
    const [text, setText] = useState('');
    const [item] = useState<ItemProperties>();
    const {username} = useContext<AuthState>(AuthContext);
    const { items, fetching, fetchingError } = useContext(ItemContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [messages, setMessages] = useState<ItemProperties[]>([]);
    const [index, setIndex] = useState(6);
    const [unsavedItems, setUnsavedItems] = useState<ItemProperties[]>([]);
    const [photo, setPhoto] = useState('');
    const [numberS, setNumberS] = useState(0);
    let networkState = useNetwork();

    useEffect(()=>{
        setUnsavedItems(JSON.parse(window.localStorage.getItem("unsavedItems")||"[]"));
        if (items){
            const arr = items.slice(0,index);
            setMessages(arr);
        }
        console.log(unsavedItems);
    }, [items, index]);

    useEffect(groupAnimations, []);
    useEffect(chainAnimations, []);

    function chainAnimations() {
        const elB = document.querySelector('.square-d');
        const elC = document.querySelector('.square-e');
        if (elB && elC) {
            const animationA = createAnimation()
                .addElement(elB)
                .duration(5000)
                .fromTo('transform', 'scale(1)', 'scale(1.5)');
            const animationB = createAnimation()
                .addElement(elC)
                .duration(7000).iterations(Infinity)
                .fromTo('transform', 'scale(1)', 'scale(0.5)');
            (async () => {
                await animationA.play();
                await animationB.play();
            })();
        }
    }

    function groupAnimations() {
        const elB = document.querySelector('.square-b');
        const elC = document.querySelector('.square-c');
        if (elB && elC) {
            const animationA = createAnimation()
                .addElement(elB)
                .fromTo('transform', 'scale(1)', 'scale(1.5)');
            const animationB = createAnimation()
                .addElement(elC)
                .fromTo('transform', 'scale(1)', 'scale(0.5)');
            const parentAnimation = createAnimation()
                .duration(10000).iterations(Infinity)
                .addAnimation([animationA, animationB]);
            parentAnimation.play();    }
    }

    function loadMore($event: CustomEvent<void>){
        if(items){
            if (items.length >= index+3){
                console.log("loading more");
                setIndex(index+3);
                const arr = items.slice(0,index);
                setMessages(arr);
                setDisableInfiniteScroll(false);
                ($event.target as HTMLIonInfiniteScrollElement).complete();
            }
            else{
                setIndex(items.length);
                const arr = items;
                setMessages(arr);
                setDisableInfiniteScroll(true);
                ($event.target as HTMLIonInfiniteScrollElement).complete();
            }
        }
    }

    function logOut(){
        window.localStorage.removeItem("token");
        history.push("/login");
    }

    const handleSendText = () => {
        const newMessage = item ? { ...item, text, username, photos: photo} : { text, username, photo };
        saveItem && saveItem(newMessage).then(() => history.goBack());
        document.getElementById("textArea")!.getElementsByTagName("textarea")[0].value ="";
        log('handleSendText...');
        setPhoto('');
        setUnsavedItems(JSON.parse(window.localStorage.getItem("unsavedItems")||"[]"));
        setNumberS(numberS+1);
    };

    log('render');

    function changeNetworkStatus(){
        if(networkState.networkStatus.connected)
            return "Online";
            return "Offline";
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonItem>
                        <IonLabel>{JSON.stringify(changeNetworkStatus())}</IonLabel>
                      {/*<IonCheckbox checked={checked} onIonChange={e => setChecked(e.detail.checked)} />*/}
                    </IonItem>
                    <IonIcon icon={chatbox}/>
                    <IonTitle className={'square-d'} style={{textAlign:'center'}}><b>Messages</b></IonTitle>
                    <IonButton className={'square-e'} onClick={()=>logOut()}>LogOut</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items"/>
                {messages && (
                    <IonList mode={"ios"}>
                        {unsavedItems.map(({ text , username, photo}) =>
                            <UnsavedItem text={text} username={username} photo={photo} onEdit={id => history.push(`/item/${id}`)}/>)}
                        {messages.map(({ id, text , username, photo}) =>
                            <Item key={id} id={id} text={text} username={username} photo={photo} onEdit={id => history.push(`/item/${id}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonInfiniteScroll disabled={disableInfiniteScroll} onIonInfinite = {(e: CustomEvent<void>) => loadMore(e)}>
                    <IonInfiniteScrollContent loadingText="loading more messages"/>
                </IonInfiniteScroll>
            </IonContent>
            <IonFooter>
                <IonGrid>
                    <IonRow><IonTextarea id="textArea" onIonChange={e => setText(e.detail.value || '')} >Type a message</IonTextarea>
                        <IonImg src={getPhotoByFilename(photo)} style={{height: '150px', width: '150px'}}/></IonRow>
                {/*<IonCard>
                    <IonTextarea slot="begin" id="textArea" onIonChange={e => setText(e.detail.value || '')} >Type a message</IonTextarea>
                    <IonImg slot="end" src={getPhotoByFilename(photos)} style={{height: '50px', weight: '50px'}}/>
                </IonCard>*/}
                </IonGrid>
                <IonButton className='square-b' onClick={ handleSendText }>Send</IonButton>
                <IonButton className='square-c' onClick={() => history.push('/map')}>Map</IonButton>
                <IonFab vertical="bottom" horizontal="end">
                    <IonFabButton onClick={() => {
                        takePhoto().then( val => { setPhoto(val.filepath) })
                    }}>
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
            </IonFooter>
        </IonPage>
    );
};

export default ItemList;

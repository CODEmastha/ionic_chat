import React, {useContext, useEffect, useState} from 'react';
import { Redirect } from 'react-router-dom';
import { AuthContext } from './provider';
import { RouteComponentProps } from 'react-router';
import {
    createAnimation,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar, IonModal
} from '@ionic/react';
import { getLogger } from '../core';
import "./CSSlogin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
const eye = <FontAwesomeIcon icon={faEye} />;

const log = getLogger('Login');

interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    useEffect(simpleAnimation, []);
    const [passwordShown, setPasswordShown] = useState(false);
    const togglePasswordVisibility = () => {
        setPasswordShown(!passwordShown);
    };
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (authenticationError)
            setOpen(true);
    }, [authenticationError]);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    function simpleAnimation() {
        const el = document.querySelector('.square-a');
        if (el) {
            const animation = createAnimation()
                .addElement(el)
                .duration(1000)
                .direction('alternate')
                .iterations(Infinity)
                .keyframes([
                    { offset: 0, transform: 'scale(3)', opacity: '1' },
                    {
                        offset: 1, transform: 'scale(1.5)', opacity: '0.5'
                    }
                ]);
            animation.play();
        }
    }

    const [state, setState] = useState<LoginState>({});
    const { username, password } = state;
    const handleLogin = () => {
        log('handleLogin...');
        login?.(username, password);
    };
    log('render');
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/' }} />
    }
    return (
        <IonPage className="IonPage">
            <IonHeader>
                <IonToolbar>
                    <IonTitle className={'square-a'}><b>Authentication</b></IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    name = "username"
                    placeholder="Username: "
                    value={username}
                    onIonChange={e => setState({
                        ...state,
                        username: e.detail.value || ''
                    })
                    }/>
                <div className="pass-wrapper">
                    {" "}
                <IonInput
                    type={passwordShown ? "text" : "password"}
                    name="password"
                    placeholder= "Password: "
                    value={password}
                    onIonChange={e => setState({
                        ...state,
                        password: e.detail.value || ''
                    })}/>
                </div>

                <IonLoading isOpen={isAuthenticating}/>
                <IonButton onClick={handleLogin}>Login</IonButton>
                <IonButton>Register</IonButton>
                <IonModal isOpen={open} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                    <p>{authenticationError?.message}</p>
                    <IonButton onClick={() => { setOpen(false); }}>EXIT</IonButton>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};



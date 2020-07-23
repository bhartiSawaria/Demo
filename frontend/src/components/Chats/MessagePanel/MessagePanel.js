
import React, { Component } from 'react';

import classes from './MessagePanel.module.css';
import firebase from '../../../firebase';
import Spinner from '../../Spinner2/Spinner2';
import Message from './Message/Message';

class MessagePanel extends Component{

    state = {
        messagesRef: firebase.firestore().collection('messages'),
        path: this.props.path,
        allMessages: [],
        isLoading: false
    }

    sortByTime = (a, b) => {
        if(a.data.timestamp > b.data.timestamp){
            return 1;
        }
        return -1;
    }

    componentDidMount(){
        const { messagesRef, path } = this.state;
        const [ path1, path2 ] = path.split('-');
        messagesRef.doc(path).onSnapshot(snap => {
            if(snap.exists){
                console.log(snap.data());
                this.setState({allMessages: snap.data().messages});
            }
        })
    }

    render(){
        let messages;
        if(this.state.isLoading){
            messages = <Spinner />
        }
        else{
            messages = this.state.allMessages.map(msg => {
                let isOwn = msg.sender == this.props.user.id ? true : false
                return (
                    <Message key={msg.timestamp} message={msg} isOwn={isOwn}/>
                )
            });
        }
        return(
            <div className={classes.RootContainer}>
                {messages}
            </div>
        )
    }
};

export default MessagePanel;

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Input } from 'semantic-ui-react';
import mime from 'mime-types';
import {v4 as uuidv4} from 'uuid';

import classes from './PrivateChat.module.css';
import MessagePanel from '../MessagePanel/MessagePanel';
import firebase from '../../../firebase';
import Backdrop from '../../Backdrop/Backdrop';

class PrivateChat extends Component{
    state = {
        message: '',
        messagesRef: firebase.firestore().collection('messages'),
        path: this.props.match.params.path,
        allMessages: [],
        isLoading: false,
        file: null,
        error: '',
        showBackdrop: false,
        showModal: false,
        uploadTask: null,
        storageRef: firebase.storage().ref()
    }

    showBackdropAndModalHandler = () => this.setState({showBackdrop: true, showModal: true});

    hideBackdropAndModalHandler = () => this.setState({showBackdrop: false, showModal: false});

    inputChangeHandler = (event) => {
        this.setState({message: event.target.value})
    }

    sendTextMessageHandler = () => {
        this.setState({isLoading: true});
        const path = (this.props.match.params.path);
        const { messagesRef } = this.state;
        messagesRef.doc(path).get().then(doc => {
            if(doc.exists){
                return messagesRef.doc(path).update({
                    messages: firebase.firestore.FieldValue.arrayUnion({
                        sender: this.props.user.id,
                        content: this.state.message,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                    })
                })
            }
            else{
                return messagesRef.doc(path).set({
                    messages: firebase.firestore.FieldValue.arrayUnion({
                        sender: this.props.user.id,
                        content: this.state.message,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                    })
                })
            }
        })
        .then((doc) => {
            console.log('Msg Written successfully id = ', doc);
            this.setState({message: '', isLoading: false});
        })
        .catch(err => {
            console.log('Error occured ', err);
            this.setState({message: '', isLoading: false});
            this.props.history.push('/error');
        })
    }

    isFileValid = () => {
        const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if(!this.state.file){
            this.setState({error: 'Please select and image.'});
            return false;
        }
        if(validTypes.includes(mime.lookup(this.state.file.name))){
            return true;
        }
        this.setState({error: 'Only jpg, png and jpeg are supported.'});
        return false;
    }

    inputFileChangeHandler = (event) => {
        this.setState({error: ''});
        this.setState({file: event.target.files[0]});
    }

    sendMediaHandler = () => {
        const { storageRef, file } = this.state;
        if(this.isFileValid()){
            this.setState({isLoading: true});
            console.log('Proceed to send.');
            console.log('history', this.props.match.params.path);
            const path = this.props.match.params.path;
            const metadata = {
                contentType: mime.lookup(file.name)
            }
            this.setState({
                uploadTask: storageRef.child('/chat/private/' + path + '/' + uuidv4() + '.jpg').put(file, metadata)
            }, () => {
                this.state.uploadTask.on('state_changed', snapshot => {
                    const progress = Math.round( (snapshot.bytesTransferred / snapshot.totalBytes) * 100) ;
                    console.log('Progress: ', progress);
                }, err => {
                    console.log(err);
                    this.props.history.push('/error');
                }, () => {
                    this.state.uploadTask.snapshot.ref.getDownloadURL().then(url => {
                        this.sendFileMessage(url);
                    })
                })
            })
        }
        else{
            console.log('Cannot proceed.');
        }
    }

    sendFileMessage = (url) => {
        const { messagesRef } = this.state;
        const path = this.props.match.params.path;
        messagesRef.doc(path).get().then(doc => {
            if(doc.exists){
                return messagesRef.doc(path).update({
                    messages: firebase.firestore.FieldValue.arrayUnion({
                        sender: this.props.user.id,
                        imageUrl: url,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                    })
                })
            }
            else{
                return messagesRef.doc(path).set({
                    messages: firebase.firestore.FieldValue.arrayUnion({
                        sender: this.props.user.id,
                        imageUrl: url,
                        timestamp: firebase.firestore.Timestamp.fromDate(new Date())
                    })
                })
            }
        })
        .then(() => {
            console.log('Msg Written successfully id');
            this.setState({file: null, isLoading: false, showBackdrop: false, showModal: false});
        })
        .catch(err => {
            console.log('Error occured ', err);
            this.setState({file: null, isLoading: false});
            this.props.history.push('/error');
        })
    }

    render(){
        // console.log(this.props.history.location.state);
        let backdrop = null;
        if(this.state.showBackdrop){
            backdrop = <Backdrop clicked={this.hideBackdropAndModalHandler}/>
        }

        let modal = null;
        if(this.state.showModal){
            modal = (
                <div className={classes.Modal}>
                    {/* <p style={{fontSize: '20px', marginBottom: '16px'}}>Choose a picture</p> */}
                    <input 
                        type='file' 
                        onChange={this.inputFileChangeHandler}
                        style={{width: '100%', backgroundColor: '#eee', padding: '8px'}}/>
                    <p style={{color: 'red'}}>{this.state.error}</p>
                    <Button 
                        loading={this.state.isLoading}
                        color='green'
                        onClick={this.sendMediaHandler}>
                        Send
                    </Button>
                    <Button
                        color='red'
                        onClick={this.hideBackdropAndModalHandler}>
                        Cancel
                    </Button>
                </div>
            )
        }

        const {receiver, sender} = this.props.history.location.state;
        return(
            <div className={classes.RootContainer}>
                {backdrop}
                {modal}
                <div className={classes.MainHeader}>
                    <img src={receiver.imageUrl} alt='profilePic'/>
                    <div> 
                        <p>{receiver.username}</p>
                        <span>{receiver.name}</span>
                    </div>
                </div>
                <MessagePanel messages={this.state.allMessages} path={this.state.path} sender={sender} user={this.props.user}/>
                <div className={classes.SendOptionsContainer}>
                    <Input 
                        type='text'
                        name='message'
                        value={this.state.message}
                        placeholder='Type Message'
                        onChange={this.inputChangeHandler}
                        style={{width: '98%'}}/>
                    <Button
                        color = 'green'
                        className={classes.MessageButton}
                        onClick={this.sendTextMessageHandler}
                        loading={this.state.isLoading}
                        disabled={this.state.message.length === 0 ? true : false}>Send Message</Button>
                    <button 
                        className={classes.MediaButton}
                        onClick={this.showBackdropAndModalHandler}>Send Image</button>
                </div>
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        token: state.auth.token,
        user: state.auth.userDetails
    }
}

export default connect(mapStateToProps)(PrivateChat);
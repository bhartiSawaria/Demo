
import React, { Component } from 'react';

import classes from './Notification.module.css';
import close from '../../../assets/images/close.png';

class Notification extends Component{

    crossIconClickHandler = () => {
        console.log('Clicked');
        fetch('https://backend-hello-world.herokuapp.com/notification', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + this.props.token
            },
            body: JSON.stringify({
                messageId: this.props.id
            })
        })
        .then(result => {
            console.log('Result 1', result);
            return result.json();
        })
        .then(result => {
            console.log('Result 2', result);
        })
        .catch(err => {
            console.log('Error in deleting a notification', err);
            this.props.history.push('/error');
        })
    }

    render(){
        return (
           <div className={classes.RootContainer}>
               <p>{this.props.message}</p>
               {/* <Icon name='close' style={{position: 'absolute', right: '0px', top: '0px'}}/> */}
               <img 
                    src={close} 
                    alt='close'
                    onClick={this.crossIconClickHandler}/>
           </div>
        )
    }
}

export default Notification;
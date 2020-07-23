
import React from 'react';
import {Button} from 'semantic-ui-react';

import classes from './User.module.css';

const user = (props) => {
    return (
        <div className={classes.RootContainer} onClick={props.clicked}>
            <div>
                <img src={props.user.imageUrl} alt='profilePic'/> 
                <p>{props.user.username}</p>
            </div>
            { props.sendMessage ? <Button onClick={props.sendMessage}>Message</Button> : null }
        </div>
    )
};

export default user;
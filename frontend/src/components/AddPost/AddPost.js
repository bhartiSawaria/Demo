
import React, { Component } from 'react';

import classes from './AddPost.module.css';

class AddPost extends Component{

    clickPostTypeHandler = (type) => {
        this.props.history.push('/add-post/type' + type);
    }

    render(){
        return(
            <div className={classes.Rootcontainer}>
                <div className={classes.PostType} onClick={() => this.clickPostTypeHandler(1)}>
                    <div>
                        <p>Share your views</p>
                    </div>
                </div>
                <div className={classes.PostType} onClick={() => this.clickPostTypeHandler(2)}>
                    <div>
                        <p>Share images </p>
                    </div>
                </div>
            </div>
        )
    }
};

export default AddPost; 
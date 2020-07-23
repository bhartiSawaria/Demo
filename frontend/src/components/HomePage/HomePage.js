
import React, { Component } from 'react';

import classes from './HomePage.module.css';
import mainImage from '../../assets/images/appIcon.jpg';

class HomePage extends Component{
    render(){
        return(
            <div className={classes.RootContainer}>
                <img src={mainImage} alt='mainImage' />
            </div>
        )
    }
};

export default HomePage;
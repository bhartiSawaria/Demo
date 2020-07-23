
import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const spinner = (props) => {
    return (
        <Dimmer active style={{height: '200vh', width: '100%', zIndex: '10'}}>
            <Loader size='huge' content="Loading" style={{position: 'absolute', top: '50vh', left: '50%'}}/>
        </Dimmer> 
    );
}

export default spinner;
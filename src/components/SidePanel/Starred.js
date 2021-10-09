import React from "react";
import { connect } from "react-redux";
import { Menu , Icon} from "semantic-ui-react";
import {setCurrentchannel, setPrivateChannel} from "../../actions";


class Starred extends React.Component {

    state = {
        activechannel: "",
        starredChannels: []
    }

    setActiveChannel = channel => {
        this.setState({ activechannel: channel.id})
    }
    
    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.props.setCurrentchannel(channel);
        this.props.setPrivateChannel(false);
    }


    displayChannels = starredChannels => {
        return starredChannels.length > 0 && starredChannels.map(channel => (
            <Menu.Item
            key={channel.id}
            onClick={() => this.changeChannel(channel)}
            name={channel.name}
            style={{opacity: 0.7}}
            active={channel.id === this.state.activechannel}
            >
                # {channel.name}
            </Menu.Item>
        ))
    }


    render() {
        const { starredChannels } = this.state;
        
        return (
            <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="star"/> CHANNELS
                        </span>{" "}
                        ({starredChannels.length })
                    </Menu.Item>
                    {this.displayChannels(starredChannels)}
                </Menu.Menu>
        )
    }

};


export default connect(null, {setCurrentchannel , setPrivateChannel })(Starred);
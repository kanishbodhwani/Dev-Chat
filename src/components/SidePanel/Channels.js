import React, {Fragment} from "react";
import { Menu , Icon, Modal, Form, Input, Button, Label} from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentchannel , setPrivateChannel} from "../../actions";

class Channels extends React.Component {

    state = {
        user: this.props.currentUser,
        channels: [],
        channel: null,
        channelName: "",
        channelDetails: "",
        modal: false,
        messagesRef: firebase.database().ref("messages"),
        channelsRef: firebase.database().ref("channels"),
        firstLoad: true,
        notifications: [],
        activechannel: ""
    };

    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid(this.state)) {
            this.addChannel();
        }
    }

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount(){
        this.removeListeners()
    }

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelsRef.on("child_added" , snap => {
            loadedChannels.push(snap.val());    
            // console.log(loadedChannels);
            this.setState({ channels: loadedChannels}, () => this.setFirstChannel());
            this.addNotoficationListener(snap.key); 
        })
    }


    addNotoficationListener = (channelId) => {
        this.state.messagesRef.child(channelId).on("value", snap => {
            if(this.state.channel) {
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        })
    }
    
    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        let index = notifications.findIndex(notification => notification.id === channelId);
        
        if(index !== -1) {
            if(channelId !== currentChannelId) {
                lastTotal= notifications[index].total;

                if(snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }

            notifications[index].lastKnownTotal = snap.numChildren();
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }

        this.setState({ notifications });
    }

    // Turning off refs calling this
    removeListeners = () => {
        this.state.channelsRef.off();    
    }

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if(this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentchannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({ channel: firstChannel })
        }
        this.setState({firstLoad: false});
    }

    addChannel = () => {
        const { channelsRef, channelName , channelDetails, user } = this.state;

        const key = channelsRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        }

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({channelDetails: "", channelName: ""});
                this.closeModal();
                console.log("channel added");
            })
            .catch(err => console.log(err));
    }

    closeModal = () => this.setState({modal: false});

    openModal = () => this.setState({modal: true});


    isFormValid = ({ channelName , channelDetails}) => channelName && channelDetails;
    
 
    handleChange = event => {
        this.setState({[event.target.name]: event.target.value});
    }
    
    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.clearNotifications();
        this.props.setCurrentchannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel })
    }


    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => {
            return notification.id === this.state.channel.id;
        })

        if(index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({ notifications: updatedNotifications});
        }
    }
    
    setActiveChannel = channel => {
        this.setState({ activechannel: channel.id})
    }
    
    getNotificationCount = (channel) => {
        let count = 0;

        this.state.notifications.forEach(notification => {
            if(notification.id == channel.id) {
                count = notification.count;
            }
        })

        if(count > 0 ) return count;
    }

    displayChannels = channels => {
        return channels.length > 0 && channels.map(channel => (
            <Menu.Item
            key={channel.id}
            onClick={() => this.changeChannel(channel)}
            name={channel.name}
            style={{opacity: 0.7}}
            active={channel.id === this.state.activechannel}
            >
                {this.getNotificationCount(channel) && (
                    <Label color="red"> {this.getNotificationCount(channel)} </Label> 
                )}
                # {channel.name}
            </Menu.Item>
        ))
    }

    render () {
        const { channels , modal} = this.state;
        return (
            <Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="exchange"/> CHANNELS
                        </span>{" "}
                        ({channels.length })
                        <Icon name="add" onClick={this.openModal}/>
                    </Menu.Item>
                    {this.displayChannels(channels)}
                </Menu.Menu>

                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>
                        Add a Channel   
                    </Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                fluid 
                                label="Name of channel" 
                                name="channelName"
                                onChange={this.handleChange}
                                />
                            </Form.Field>

                            <Form.Field>
                                <Input 
                                fluid
                                label="About the channel" 
                                name="channelDetails"
                                onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" /> Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Fragment>
        )
    }
};

export default connect(null, { setCurrentchannel, setPrivateChannel })(Channels);
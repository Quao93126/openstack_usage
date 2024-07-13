import { React, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Widget, addResponseMessage } from 'react-chat-widget';
import defaultChannelIcon from './assets/team.svg';
import avatarImg from '../../assets/images/avatar.png';

import PropTypes from 'prop-types';
import SlackBot from 'slack';
import { load as emojiLoader, parse as emojiParser } from 'gh-emoji';
// Chat Functions
import {
  wasIMentioned,
  decodeHtml,
  postFile,
  getNewMessages,
  hasEmoji,
  hasAttachment,
  isSystemMessage,
  isAdmin,
} from './slackChat_func/chat-functions';
import { hooks, themes, utils, cacheChannelMap } from './slackChat_func';
// Slack API Funcs
import {
  getChannels,
  getUsers,
  getMessages,
  postMessage,
} from './slackChat_func/slack-utils';
import './ReactSlackChat.scss';
import OpenAI from 'openai';

// Utils
const { debugLog, arraysIdentical } = utils;

// Hooks
const { isHookMessage, execHooksIfFound } = hooks;

// Themes
const { changeColorRecursive } = themes;

// Cached Channel Map
const { getCachedChannelMap, saveChannelMap } = cacheChannelMap;

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

const SupportChatGCP = (props) => {
  const [apiToken, setApiToken] = useState(
    'xoxb-2644799806533-5544927883447-SEA5HV8ZYFOtk9Zgh5QLdbbu',
  );
  const [bot, setBot] = useState(new SlackBot({ token: apiToken }));
  const [botName, setBotName] = useState('support-ias-react-bot');
  const [channels, setChannels] = useState([
    {
      name: 'ias-support-chat',
      id: 'C04H9NKCKR6',
    },
  ]);
  const [defaultChannel, setDefaultChannel] = useState('ias-support-chat');
  const [hooks, setHooks] = useState([
    {
      /* My Custom Hook */
      id: 'getSystemInfo',
      action: () => Promise.resolve('MY SYSTEM INFO!'),
    },
  ]);
  const [failed, setFailed] = useState(false);
  const [messages, setMessages] = useState([]);
  // keep track of user threads for messaging in singleUserMode
  const [chatbox, setChatbox] = useState({
    active: false,
    channelActiveView: false,
    chatActiveView: false,
  });

  const [refreshTime, setRefreshTime] = useState(5000);
  var chatInitiatedTs = '';
  var activeChannel = {
    name: 'ias-support-chat',
    id: 'C04H9NKCKR6',
  };
  var activeChannelInterval = null;

  const TS_MAP = getCachedChannelMap({ channels: channels });

  const handleNewUserMessage = async (newMessage) => {
    // Now send the message throught the backend API
    //add messsage to slack channel
    postMyMessage(newMessage, 'Customer');
    //end
    let responseMessage = await generateChatResponse(newMessage);
    //postMyMessage(responseMessage, botName);
    // console.log("new response --->", responseMessage);
    //let responseMessage = "This is temp message"
    postMyMessage(responseMessage, botName);
    addResponseMessage(responseMessage);

    setTimeout(() => {
      addResponseMessage('This is response message I am testing.');
    }, 5000);
    openChatBox(null);
  };

  const generateChatResponse = async (payload) => {
    // const url = 'https://api.openai.com/v1/engines/davinci/completions';
    // const prompt = `User: ${message}\nBot: `;
    // const data = {
    //   prompt,
    //   max_tokens: 60,
    //   temperature: 0.7,
    //   n: 1,
    //   stop: '\n',
    // };
    // const headers = {
    //   'Content-Type': 'application/json',
    //   Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
    // };
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers,
    //   body: JSON.stringify(data),
    // });
    // const { choices } = await response.json();
    // return choices[0].text.trim();

    const openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const system_message = `
    You are an expert in Image Processing Engineer with rich experience in microscopy image.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: system_message },
        { role: 'user', content: payload },
      ],
      temperature: 0,
    });

    // const { choices } = await response.json();

    //console.log(response)
    // console.log(choices)
    return response.choices[0].message.content;
  };

  const postMyMessage = (message, senderName) => {
    return postMessage({
      bot: bot,
      text: message,
      singleUserMode: false,
      ts: TS_MAP[activeChannel.name || activeChannel.name],
      apiToken: apiToken,
      channel: activeChannel.id,
      username: senderName,
    }).catch((err) => {
      if (err) {
        //console.log('failed to post. Err:', err);
      }
      return null;
    });
  };

  const gotNewMessages = (_newMessages) => {
    // const newCount = this.state.newMessageNotification + newMessages.length;
    // this.setState({newMessageNotification: newCount});
  };

  const loadMessages = (channel) => {
    if (!chatInitiatedTs) {
      chatInitiatedTs = Date.now() / 1000;
    }
    // define loadMessages function
    const getMessagesFromSlack = () => {
      const messagesLength = messages.length;
      getMessages({
        bot: bot,
        apiToken: apiToken,
        channelId: channel.id,
        singleUserMode: props.singleUserMode,
        ts: TS_MAP[channel.name || channel.id],
      })
        .then((messagesData) => {
          // let msg_data = messagesData.messages;
          // msg_data.map((msg) => {return msg.team === "T02JYPHPQFP" || msg.username === "support-ias-react-bot"});
          if (!arraysIdentical(messages, messagesData.messages.reverse())) {
            // Got new messages
            // We dont wish to execute action hooks if user opens chat for the first time
            if (messages.length !== 0) {
              // Execute action hooks only if they are really new messages
              // We know they are really new messages by checking to see if we already have messages in the state
              // Only if we atleast have some messages in the state
              // Grab new messages
              const newMessages = getNewMessages(
                messages,
                messagesData.messages,
                props.botName,
              );
              gotNewMessages(newMessages);
              // Iterate over the new messages and exec any action hooks if found
              if (newMessages) {
                newMessages.map((message) =>
                  execHooksIfFound({
                    bot: bot,
                    message,
                    username: props.botName,
                    customHooks: props.hooks,
                    apiToken: apiToken,
                    channel: activeChannel.id,
                  }),
                );
              }
            }
            // set the state with new messages
            setMessages(messagesData.messages);
            if (props.defaultMessage) {
              // add timestamp so list item will have unique key
              messages.unshift({
                text: props.defaultMessage,
                ts: chatInitiatedTs,
              });
            }
            return setMessages(messages, () => {
              // if div is already scrolled to bottom, scroll down again just incase a new message has arrived
              const chatMessages = document.getElementById(
                'widget-reactSlakChatMessages',
              );
              chatMessages.scrollTop =
                chatMessages.scrollHeight < chatMessages.scrollTop + 600 ||
                messagesLength === 0
                  ? chatMessages.scrollHeight
                  : chatMessages.scrollTop;
            });
          }
        })
        .catch((err) => {
          debugLog(
            `There was an error loading messages for ${channel.name}. ${err}`,
          );
          return setFailed(true);
        });
    };
    // Call it once
    getMessagesFromSlack();
    // Set the function to be called at regular intervals
    // get the history of channel at regular intevals
    activeChannelInterval = setInterval(getMessagesFromSlack, refreshTime);
  };

  const goToChatView = (e, channel) => {
    // stop propagation so we can prevent any other click events from firing
    e.stopPropagation();
    // Close Chat box only if not already open
    if (chatbox.active) {
      activeChannel = channel;
      setChatbox({
        active: true,
        channelActiveView: false,
        chatActiveView: true,
      }).then(() => {
        if (activeChannelInterval) {
          clearInterval(activeChannelInterval);
        }
        // Focus input box
        const inputTextBox = document.getElementById('chat__input__text');
        inputTextBox.focus();
        loadMessages(channel);
      });
      // Set this channel as active channel
    }
    return false;
  };

  const openChatBox = (e) => {
    // stop propagation so we can prevent any other click events from firing
    // e.stopPropagation();
    // persist click event to stopPropagation later
    // e.persist();
    // Open Chat box only if not already open
    // if (!chatbox.active) {
    setChatbox({
      active: true,
      channelActiveView: true,
      chatActiveView: false,
    }).then(() => {
      // Look to see if an active channel was already chosen...
      if (Object.keys(activeChannel).length > 0) {
        // If yes, load that chat view instead
        goToChatView(e, activeChannel);
      }
    });
    // }
    return false;
  };

  const closeChatBox = (e) => {
    // stop propagation so we can prevent any other click events from firing
    e.stopPropagation();
    // Close Chat box only if not already open
    if (chatbox.active) {
      setChatbox({
        active: false,
        channelActiveView: false,
        chatActiveView: false,
      });
    }
    return false;
  };

  return (
    <>
      <Widget
        onClick={(e) => {
          openChatBox(e);
        }}
        handleNewUserMessage={handleNewUserMessage}
        profileAvatar={defaultChannelIcon}
        titleAvatar={defaultChannelIcon}
        profileClientAvatar={avatarImg}
        title="STATUS"
        subtitle="ias-support-chat"
        senderPlaceHolder="Enter your message."
      />
    </>
  );
};

export default connect(mapStateToProps)(SupportChatGCP);

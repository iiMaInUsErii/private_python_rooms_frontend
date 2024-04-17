import { useState, useEffect, useRef } from 'react'
import * as antd from 'antd';
import { SendOutlined, SmileOutlined } from '@ant-design/icons';
import { MessageBox, Input, Button } from 'react-chat-elements'
import EmojiPicker from 'emoji-picker-react';
import 'react-chat-elements/dist/main.css'
import './App.css'

// let host = "http://127.0.0.1:3000"
let host = "https://arturkhromov.pythonanywhere.com"

function App() {
  const connectRef = useRef(null)
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [emojiShow, setEmojiShow] = useState(false)
  const [data, setDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('account')) {
      let data = JSON.parse(localStorage.getItem('account'))
      setName(data.name)
      setRoom(data.room)
      setPassword(data.password)
    }
  }, [])

  const connect = () => {
    console.log('click')
    fetch(host+'/chat', {
      method: 'post',
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      body: JSON.stringify({
          name: name,
          room: room,
          password: password
      })
    }).then(res => res.json())
    .then(res => {
      if (res.messages) {
        setDate(res)
        setTimeout(() => {
          scroll(0,1000);
        }, 1)
        localStorage.setItem('account', JSON.stringify({
          name: name,
          room: room,
          password: password
        }))
      }
      else if (res.error) {
        setError('Invalid Data')
      }
    })
  }

  const send = () => {
    console.log('click')
    fetch(host+'/new', {
      method: 'post',
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      body: JSON.stringify({
        room: room,
        name: name,
        password: password,
        text: message
      })
    }).then(res => res.json())
    .then(res => res.status ? connect() : '')
    .then(setMessage(''))
  }

  const deleteMsg = (id) => {
    console.log('click delete')
    fetch(host+'/delete', {
      method: 'post',
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      body: JSON.stringify({
        room: room,
        name: name,
        password: password,
        id: id
      })
    }).then(res => res.json())
    .then(res => res.status ? connect() : '')
  }

  return (
    <>
      {data.messages ? 
        <div>
          <div className='chat' 
            style={{ marginBottom: '50px' }}
          >
            {data.messages.map((message, key) => (
              <MessageBox
                position={message[2] == name ? 'right' : 'left'}
                type={'text'}
                title={message[2] != name ? message[2] : ''}
                text={message[3]}
                date={message[4] * 1000}
                removeButton={message[2] == name ? true : false}
                onRemoveMessageClick={() => deleteMsg(message[0])}
                key={key}
              />
            ))}
          </div>
          <div id='new-message-panel'>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              inputStyle={{backgroundColor: '#ddd'}}
              maxHeight={50}
              maxlength={400}
              autofocus={true}
              placeholder='Enter message'
              rightButtons={<Button onClick={send} color='#048' backgroundColor='#6BACDD' style={{margin: 0}} text={<SendOutlined />} />}
              leftButtons={<Button onClick={() => setEmojiShow(!emojiShow)} color='#444' backgroundColor='#ccc' fontSize='2000px' style={{margin: 0}} text={<SmileOutlined className='smile'/>} disabled/>}
            />
            <EmojiPicker open={emojiShow} onEmojiClick={(e) => setMessage(prev => prev + e.emoji)} searchDisabled={true} lazyLoadEmojis={true} width={'100%'} height={'45vh'} allowExpandReactions={false} />
          </div>
        </div> : 
        <form className='connect-form'>
          <antd.Input onChange={(e) => setName(e.target.value)} addonBefore="Name: " value={name} />
          <antd.Input onChange={(e) => setRoom(e.target.value)} addonBefore="Room: " value={room} />
          <antd.Input onChange={(e) => setPassword(e.target.value)} addonBefore="Password: " value={password} placeholder='(optional)'/>
          <antd.Button onClick={connect} ref={connectRef} type="primary" block>Connect</antd.Button>
        </form>
      }
    </>
  )
}

export default App

const Notification = ({ message }) => {
  if (!message) {
    return
  }

  // const style = {
  //   color: message.type === 'error' ? 'red' : 'green',
  //   background: 'lightgrey',
  //   fontSize: 20,
  //   borderStyle: 'solid',
  //   borderRadius: 5,
  //   padding: 10,
  //   marginBottom: 10,
  // }

  return (
    <div className="error">
      {message}
    </div>)
}

export default Notification

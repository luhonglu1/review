import React from 'react'
import { connect } from './react-redux'

function addCountAction(dispatch) {
  setTimeout(() => {
    dispatch({ type: 'plus' })
  }, 1000)
}

const mapStateToProps = (state) => {
  return {
    count: state.count,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addCount: () => {
      dispatch(addCountAction)
    },
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="App">
        {this.props.count}
        <button onClick={() => this.props.addCount()}>增加</button>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
